/* eslint-disable @typescript-eslint/no-require-imports -- This dependency-free Node harness uses CommonJS. */
const assert = require('node:assert/strict')
const test = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

const root = path.resolve(__dirname, '..')

function fixture({ role = 'member', rows, user } = {}) {
    const currentUser = user === undefined ? {
        id: 'auth-user', email: 'person@example.com', email_confirmed_at: '2026-01-01T00:00:00Z',
    } : user
    const profiles = rows || [{ id: 'auth-user', email: 'person@example.com', role, is_active: true }]
    const writes = []
    const queries = []
    function client(service) {
        return {
            auth: {
                getUser: async () => ({ data: { user: service ? null : currentUser }, error: null }),
                signInWithPassword: async () => { writes.push({ kind: 'sign-in' }); return { error: null } },
                admin: {
                    createUser: async () => { writes.push({ kind: 'create-user' }); return { data: { user: { id: 'new-user', email: 'new@example.com' } }, error: null } },
                    deleteUser: async id => { writes.push({ kind: 'delete-user', id }); return { error: null } },
                },
            },
            from(table) {
                const filters = []
                let mutation
                const query = {
                    select() { return query },
                    eq(key, value) { filters.push(row => row[key] === value); queries.push({ table, key, value }); return query },
                    ilike(key, value) { filters.push(row => String(row[key]).toLowerCase() === value.replaceAll('\\', '').toLowerCase()); return query },
                    neq() { return query },
                    order() { return query },
                    limit() { return query },
                    update(data) { mutation = { kind: 'update', table, data }; return query },
                    insert(data) { mutation = { kind: 'insert', table, data }; return query },
                    delete() { mutation = { kind: 'delete', table }; return query },
                    match(match) { if (mutation) writes.push({ ...mutation, match }); return Promise.resolve({ data: null, error: null }) },
                    maybeSingle: async () => ({ data: table === 'admins' ? profiles.find(row => filters.every(f => f(row))) || null : null, error: null }),
                    then(resolve, reject) { if (mutation) writes.push(mutation); return Promise.resolve({ data: [], error: null }).then(resolve, reject) },
                }
                return query
            },
        }
    }
    const regular = client(false)
    const service = client(true)
    const cache = new Map()
    function load(relative) {
        const absolute = path.resolve(root, relative)
        if (cache.has(absolute)) return cache.get(absolute).exports
        const loadedModule = { exports: {} }
        cache.set(absolute, loadedModule)
        const source = fs.readFileSync(absolute, 'utf8')
        const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText
        const localRequire = specifier => {
            if (specifier === 'server-only') return {}
            if (specifier === '@/lib/supabase/server') return { createClient: async () => regular }
            if (specifier === '@/lib/supabase/admin') return { createAdminClient: async () => service }
            if (specifier === 'next/cache') return { revalidatePath() {} }
            if (specifier === 'next/navigation') return { redirect(url) { throw new Error(`REDIRECT:${url}`) } }
            if (specifier.endsWith('/components/AdminSidebar')) return { AdminSidebar() {} }
            if (specifier.endsWith('/components/TeamClient')) return { TeamClient() {} }
            if (specifier.endsWith('/components/PortfolioClient')) return { PortfolioClient() {} }
            if (specifier === './MessagesClient' || specifier === './AppSettingsForm') return { default() {} }
            if (specifier.startsWith('@/')) return load(`${specifier.slice(2)}.ts`)
            if (specifier.startsWith('.')) return load(path.relative(root, path.resolve(path.dirname(absolute), `${specifier}.ts`)))
            return require(specifier)
        }
        new Function('require', 'module', 'exports', output)(localRequire, loadedModule, loadedModule.exports)
        return loadedModule.exports
    }
    return { load, writes, queries }
}

test('member cannot promote themselves or modify another profile', async () => {
    const state = fixture()
    const { updateAdmin } = state.load('app/admin/actions.ts')
    const form = new FormData()
    form.set('firstName', 'Changed')
    form.set('role', 'admin')
    await assert.rejects(updateAdmin('another-user', form), /Unauthorized/)
    assert.equal(state.writes.length, 0)
})

test('own profile update ignores a forged role field', async () => {
    const state = fixture()
    const { updateAdmin } = state.load('app/admin/actions.ts')
    const form = new FormData()
    form.set('firstName', 'Updated')
    form.set('role', 'admin')
    await updateAdmin('auth-user', form)
    assert.equal(state.writes.length, 1)
    assert.equal(state.writes[0].data.first_name, 'Updated')
    assert.equal(Object.hasOwn(state.writes[0].data, 'Role'), false)
    assert.equal(Object.hasOwn(state.writes[0].data, 'role'), false)
})

test('member cannot create an administrator or change app settings', async () => {
    for (const actionName of ['signup', 'toggleAdminStatus', 'updateAppSettings', 'uploadAsset', 'deleteAsset', 'updateAsset', 'toggleAssetStatus', 'deleteAdmin', 'getAdmins', 'getContactSubmissions', 'deleteContactSubmission']) {
        const state = fixture()
        const actions = state.load('app/admin/actions.ts')
        const argumentsForAction = actionName === 'signup' || actionName === 'updateAppSettings' || actionName === 'uploadAsset' ? [new FormData()] : ['other-user', true]
        await assert.rejects(actions[actionName](...argumentsForAction), /Unauthorized/, actionName)
        assert.equal(state.writes.length, 0, actionName)
    }
})

test('admin can delete another account using the authenticated session', async () => {
    const state = fixture({ role: 'admin' })
    await state.load('app/admin/actions.ts').deleteAdmin('other-user')
    assert.equal(state.writes.some(write => write.kind === 'delete-user' && write.id === 'other-user'), true)
})

test('creating a member preserves the administrator session and the schema role column', async () => {
    const state = fixture({ role: 'admin' })
    const form = new FormData()
    form.set('email', 'new@example.com')
    form.set('password', 'example-password')
    form.set('role', 'member')
    const result = await state.load('app/admin/actions.ts').signup(form)
    assert.equal(result.success, true)
    assert.equal(state.writes.some(write => write.kind === 'sign-in'), false)
    const inserted = state.writes.find(write => write.kind === 'insert' && write.table === 'admins')
    assert.equal(inserted.data[0].role, 'member')
})

test('members and anonymous visitors cannot directly open privileged pages', async () => {
    for (const page of ['dashboard', 'team', 'portfolio', 'messages', 'settings/app']) {
        const member = fixture()
        await assert.rejects(member.load(`app/admin/${page}/page.tsx`).default(), /REDIRECT:\/admin\/settings\/profile/, page)
        const anonymous = fixture({ user: null })
        await assert.rejects(anonymous.load(`app/admin/${page}/page.tsx`).default(), /REDIRECT:\/admin$/, page)
    }
})

test('role normalization accepts both database spellings and rejects malformed privileges', () => {
    const { normalizeAdminRole } = fixture().load('lib/auth/roles.ts')
    for (const [profile, expected] of [
        [{ Role: ' ADMIN ' }, 'admin'], [{ role: 'AdMiN' }, 'admin'], [{ Role: 'member' }, 'member'],
        [null, null], [{ Role: 1 }, null], [{ Role: 'owner' }, null], [{ role: 'admin', is_active: false }, null],
    ]) assert.equal(normalizeAdminRole(profile), expected)
})

test('all admin destinations are available while member navigation stays personal', () => {
    const { getAdminNavigation } = fixture().load('lib/auth/navigation.ts')
    assert.deepEqual(getAdminNavigation('admin').map(item => item.href), [
        '/admin/dashboard', '/admin/messages', '/admin/team', '/admin/portfolio', '/admin/qr-showcase',
        '/admin/settings/profile', '/admin/settings/app',
    ])
    assert.deepEqual(getAdminNavigation('member').map(item => item.href), ['/admin/settings/profile'])
    assert.deepEqual(getAdminNavigation(null).map(item => item.href), ['/admin/settings/profile'])
})

test('profile resolution uses auth id before verified legacy email', async () => {
    const state = fixture({ rows: [{ id: 'auth-user', email: 'outdated@example.com', Role: ' ADMIN ', is_active: true }] })
    const result = await state.load('lib/auth/server.ts').getCurrentProfile()
    assert.equal(result.role, 'admin')
    assert.equal(result.profile.id, 'auth-user')
    assert.deepEqual(state.queries[0], { table: 'admins', key: 'id', value: 'auth-user' })
    const legacy = fixture({ rows: [{ id: 'legacy-id', email: 'PERSON@example.com', role: 'admin' }] })
    assert.equal((await legacy.load('lib/auth/server.ts').getCurrentProfile()).role, 'admin')
})

test('unverified email and metadata cannot supply admin privileges', async () => {
    const state = fixture({
        user: { id: 'auth-user', email: 'person@example.com', email_confirmed_at: null, user_metadata: { role: 'admin' } },
        rows: [{ id: 'legacy-id', email: 'person@example.com', role: 'admin' }],
    })
    const auth = state.load('lib/auth/server.ts')
    assert.equal((await auth.getCurrentProfile()).role, null)
    await assert.rejects(auth.requireAdmin(), /Unauthorized/)
})
