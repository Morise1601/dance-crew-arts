import { getAppSettings, getCrewMembers } from "./admin/actions";
import HomeClient from "@/components/HomeClient";

export default async function Home() {
    const { data: settings } = await getAppSettings();
    const { data: members } = await getCrewMembers();
    
    return <HomeClient founderImg={settings?.founder_img} members={members || []} />;
}
