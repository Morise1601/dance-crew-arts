'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/admin', 'layout')
    redirect('/admin')
}

export async function signup(formData: FormData) {
    const supabaseAdmin = await createAdminClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const phone = formData.get('phone') as string
    const role = formData.get('role') as string || 'member'
    const avatarFile = formData.get('avatar') as File | null

    let avatarUrl = null
    if (avatarFile && avatarFile.size > 0) {
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `avatars/${fileName}`

        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('admin_assets')
            .upload(filePath, avatarFile)

        if (!uploadError) {
            const { data: { publicUrl } } = supabaseAdmin.storage
                .from('admin_assets')
                .getPublicUrl(filePath)
            avatarUrl = publicUrl
        }
    }

    // Create user with admin privileges to skip email confirmation
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // This skips confirmation email
    })

    if (error) {
        return { error: error.message }
    }

    if (data.user) {
        // Now use regular client for public DB operations if needed (but service role works too)
        const { error: adminError } = await supabaseAdmin
            .from('admins')
            .insert([{
                id: data.user.id,
                email: data.user.email!,
                first_name: firstName,
                last_name: lastName,
                phone: phone,
                Role: role,
                avatar_url: avatarUrl,
                is_active: true
            }])

        if (adminError) {
            return { error: adminError.message }
        }
    }

    // After creation, log in the user using regular client
    const supabase = await createClient()
    await supabase.auth.signInWithPassword({ email, password })

    revalidatePath('/admin', 'layout')
    redirect('/admin')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/admin', 'layout')
    redirect('/admin')
}

export async function getAdmins() {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user
    if (!user) throw new Error('Unauthorized')

    const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) return { error: error.message }
    return { data }
}

export async function getCrewMembers() {
    const supabase = await createClient()
    // Only show active members on public page
    const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('Role', 'member')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

    if (error) return { error: error.message }
    return { data }
}

export async function toggleAdminStatus(id: string, isActive: boolean) {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) throw new Error('Unauthorized')

    const supabaseAdmin = await createAdminClient()
    const { error } = await supabaseAdmin
        .from('admins')
        .update({ is_active: isActive })
        .match({ id })

    if (error) return { error: error.message }
    revalidatePath('/admin/team')
    revalidatePath('/')
    return { success: true }
}

export async function updateAdmin(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user
    if (!user) throw new Error('Unauthorized')

    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const phone = formData.get('phone') as string
    const role = formData.get('role') as string
    const avatarFile = formData.get('avatar') as File | null

    let updateData: any = {
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        Role: role
    }

    if (avatarFile && avatarFile.size > 0) {
        const supabaseAdmin = await createAdminClient()
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `avatars/${fileName}`

        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('admin_assets')
            .upload(filePath, avatarFile)

        if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
                .from('admin_assets')
                .getPublicUrl(filePath)
            updateData.avatar_url = publicUrl
        }
    }

    const supabaseAdmin = await createAdminClient()
    const { error } = await supabaseAdmin
        .from('admins')
        .update(updateData)
        .match({ id })

    if (error) return { error: error.message }
    revalidatePath('/admin')
    return { success: true }
}

export async function deleteAdmin(id: string) {
    const supabaseAdmin = await createAdminClient()

    const { data: userData } = await supabaseAdmin.auth.getUser()
    const currentUser = userData?.user
    if (!currentUser) throw new Error('Unauthorized')

    // Don't allow self-deletion via dashboard
    if (currentUser.id === id) return { error: "You cannot delete your own account." }

    // Delete from auth (using admin privileges)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id)
    if (authError) return { error: authError.message }

    // Delete from public table
    const { error: dbError } = await supabaseAdmin
        .from('admins')
        .delete()
        .match({ id })

    if (dbError) return { error: dbError.message }

    revalidatePath('/admin')
    return { success: true }
}


export async function uploadAsset(formData: FormData) {
    const supabase = await createClient()

    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user
    if (!user) throw new Error('Unauthorized')

    const file = formData.get('file') as File
    const name = formData.get('name') as string
    const type = formData.get('type') as 'icon' | 'owner' | 'video'

    if (!file || !name || !type) {
        return { error: 'Missing required fields' }
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${type}/${fileName}`

    const supabaseAdmin = await createAdminClient()
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('portfolio')
        .upload(filePath, file)

    if (uploadError) {
        return { error: uploadError.message }
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
        .from('portfolio')
        .getPublicUrl(filePath)

    // Save to database
    const { error: dbError } = await supabaseAdmin
        .from('portfolio_assets')
        .insert([{
            name,
            type,
            url: publicUrl,
            storage_path: filePath,
            admin_id: user.id,
            is_active: true
        }])

    if (dbError) {
        return { error: dbError.message }
    }

    revalidatePath('/admin')
    return { success: true }
}

export async function deleteAsset(id: string, storagePath: string) {
    const supabase = await createClient()

    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user
    if (!user) throw new Error('Unauthorized')

    const supabaseAdmin = await createAdminClient()

    // Delete from storage
    const { error: storageError } = await supabaseAdmin.storage
        .from('portfolio')
        .remove([storagePath])

    if (storageError) {
        console.error('Storage delete error:', storageError)
        // Continue anyway to clean up DB if storage is already gone
    }

    // Delete from DB
    const { error: dbError } = await supabaseAdmin
        .from('portfolio_assets')
        .delete()
        .match({ id })

    if (dbError) {
        return { error: dbError.message }
    }

    revalidatePath('/admin')
    return { success: true }
}

export async function updateAsset(id: string, name: string) {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user
    if (!user) throw new Error('Unauthorized')

    const supabaseAdmin = await createAdminClient()
    const { error } = await supabaseAdmin
        .from('portfolio_assets')
        .update({ name })
        .match({ id })

    if (error) return { error: error.message }
    revalidatePath('/admin')
    revalidatePath('/portfolio')
    return { success: true }
}

export async function toggleAssetStatus(id: string, isActive: boolean) {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user
    if (!user) throw new Error('Unauthorized')

    const supabaseAdmin = await createAdminClient()
    const { error } = await supabaseAdmin
        .from('portfolio_assets')
        .update({ is_active: isActive })
        .match({ id })

    if (error) return { error: error.message }
    revalidatePath('/admin')
    revalidatePath('/portfolio')
    return { success: true }
}

export async function getAppSettings() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .maybeSingle()

    if (error && error.code !== 'PGRST116') return { error: error.message }
    return { data: data || null }
}

export async function updateAppSettings(formData: FormData) {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user
    if (!user) throw new Error('Unauthorized')

    const logoFile = formData.get('logo') as File | null
    const founderFile = formData.get('founder') as File | null
    const coFounderFile = formData.get('coFounder') as File | null

    const founderAddress = formData.get('founder_address') as string
    const emails = formData.getAll('founder_email') as string[]
    const contacts = formData.getAll('founder_contact') as string[]

    const updateData: any = {
        updated_by: user.id,
        updated_at: new Date().toISOString(),
        founder_address: founderAddress,
        founder_email: emails.filter(e => e.trim() !== ''),
        founder_contact: contacts.filter(c => c.trim() !== '')
    }

    const uploadSettingImg = async (file: File | null, path: string) => {
        if (!file || file.size === 0) return null
        const supabaseAdmin = await createAdminClient()
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `settings/${path}/${fileName}`

        const { data, error } = await supabaseAdmin.storage
            .from('admin_assets')
            .upload(filePath, file)

        if (error) throw error

        const { data: { publicUrl } } = supabaseAdmin.storage
            .from('admin_assets')
            .getPublicUrl(filePath)
        return publicUrl
    }

    try {
        if (logoFile && logoFile.size > 0) updateData.logo_url = await uploadSettingImg(logoFile, 'logo')
        if (founderFile && founderFile.size > 0) updateData.founder_img = await uploadSettingImg(founderFile, 'founder')
        if (coFounderFile && coFounderFile.size > 0) updateData.co_founder_img = await uploadSettingImg(coFounderFile, 'co-founder')

        const supabaseAdmin = await createAdminClient()

        // Get the first row if it exists
        const { data: existing } = await supabaseAdmin
            .from('app_settings')
            .select('id')
            .limit(1)
            .maybeSingle()

        if (existing) {
            const { error } = await supabaseAdmin
                .from('app_settings')
                .update(updateData)
                .match({ id: existing.id })
            if (error) throw error
        } else {
            const { error } = await supabaseAdmin
                .from('app_settings')
                .insert([updateData])
            if (error) throw error
        }

        revalidatePath('/', 'layout')
        revalidatePath('/admin')
        return { success: true }
    } catch (err: any) {
        return { error: err.message }
    }
}


export async function submitContactForm(formData: FormData) {
    const supabase = await createClient();

    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    if (!firstName || !lastName || !email || !message) {
        return { error: 'All fields are required' };
    }

    // Store in Database
    const { error: dbError } = await supabase
        .from('contact_submissions')
        .insert([{
            first_name: firstName,
            last_name: lastName,
            email: email,
            message: message
        }]);

    if (dbError) {
        return { error: 'Failed to save message. Please try again.' };
    }

    return { success: true };
}

export async function getContactSubmissions() {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new Error('Unauthorized');

    const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return { error: error.message };
    return { data };
}

export async function deleteContactSubmission(id: string) {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) throw new Error('Unauthorized');

    const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .match({ id });

    if (error) return { error: error.message };
    revalidatePath('/admin/messages');
    return { success: true };
}

