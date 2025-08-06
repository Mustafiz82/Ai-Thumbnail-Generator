import ThumbnailGenerator from "@/components/ThumbnailGenerator";
import Image from "next/image";
import { Analytics } from "@vercel/analytics/next"
export default function Home() {
  return (
   <div>
    <ThumbnailGenerator/>
    <Analytics/>
   </div>
  );  
}
