import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { Button } from "../ui/button";
import { MessageCircleCode } from "lucide-react";
import WorkSpaceHistory from "./WorkSpaceHistory";
import SideBarFooter from "./SideBarFooter";
import { useRouter } from "next/navigation"; 

function AppSideBar() {
  const router = useRouter();

  const handleStartNewChat = () => {
    router.push("/"); 
  };

  return (
    <div>
      <Sidebar>
        <SidebarHeader className="p-5">
          <Image src={"/pngwing.com.png"} alt="Logo" width={40} height={40} />
        </SidebarHeader>
        <SidebarContent className="p-5">
          <Button onClick={handleStartNewChat}>
            <MessageCircleCode />
            Start New Chat
          </Button>
          <SidebarGroup>
            <WorkSpaceHistory />
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SideBarFooter />
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}

export default AppSideBar;
