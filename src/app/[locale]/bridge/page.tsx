"use client";
import Widget from "components/LiFiWidget";
import { WidgetEvents } from "components/LiFiWidget/WidgetEvents";

const LiFiWidgetPage = () => {
  return (
    <main>
      <WidgetEvents />
      <Widget />
    </main>
  );
};

export default LiFiWidgetPage;
