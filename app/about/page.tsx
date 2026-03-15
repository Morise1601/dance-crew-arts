import { getAppSettings } from "../admin/actions";
import AboutClient from "@/components/AboutClient";

export default async function AboutPage() {
    const { data: settings } = await getAppSettings();
    
    return <AboutClient founderImg={settings?.founder_img} coFounderImg={settings?.co_founder_img} />;
}
