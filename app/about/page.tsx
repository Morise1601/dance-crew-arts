import { getAppSettings } from "../admin/actions";
import AboutClient from "@/components/AboutClient";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata('/about');

export default async function AboutPage() {
    const { data: settings } = await getAppSettings();
    
    return <AboutClient founderImg={settings?.founder_img} coFounderImg={settings?.co_founder_img} />;
}
