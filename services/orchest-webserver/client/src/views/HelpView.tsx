import { Layout, useLayout } from "@/components/Layout";
import { useOrchest } from "@/hooks/orchest";
import { useSendAnalyticEvent } from "@/hooks/useSendAnalyticEvent";
import { siteMap } from "@/routingConfig";
import { MDCButtonReact } from "@orchest/lib-mdc";
import * as React from "react";

const HelpView: React.FC = () => {
  const { state } = useOrchest();

  useSendAnalyticEvent("view load", { name: siteMap.help.path });
  const { setIsOnboardingDialogOpen } = useLayout();

  return (
    <Layout>
      <div className="view-page help-list">
        <h2>Looking for help, or want to know more?</h2>
        <p className="push-down">
          Please contact our support!.
        </p>
      </div>
    </Layout>
  );
};

export default HelpView;
