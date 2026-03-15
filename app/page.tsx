import { getAppSettings, getCrewMembers, getPortfolioAssets } from "./admin/actions";
import HomeClient from "@/components/HomeClient";

export default async function Home() {
    const { data: settings } = await getAppSettings();
    const { data: members } = await getCrewMembers();
    const { data: photos } = await getPortfolioAssets('photos');
    
    return <HomeClient founderImg={settings?.founder_img} members={members || []} portfolioPhotos={photos || []} />;
}
