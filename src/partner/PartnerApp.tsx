import { Route, Switch, Redirect } from "wouter";
import "./partner-theme.css";
import { DemoDataProvider } from "./context/demo-data-context";
import { PartnerLayout } from "./components/layout/PartnerLayout";
import { partnerPaths } from "./routes";
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Bookings";
import Experiences from "./pages/Experiences";
import Availability from "./pages/Availability";
import Payouts from "./pages/Payouts";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";

export default function PartnerApp() {
  return (
    <DemoDataProvider>
      <PartnerLayout>
        <Switch>
          <Route path={partnerPaths.dashboard} component={Dashboard} />
          <Route path={partnerPaths.bookings} component={Bookings} />
          <Route path={partnerPaths.experiences} component={Experiences} />
          <Route path={partnerPaths.availability} component={Availability} />
          <Route path={partnerPaths.payouts} component={Payouts} />
          <Route path={partnerPaths.messages} component={Messages} />
          <Route path={partnerPaths.profile} component={Profile} />
          <Route>
            <Redirect to={partnerPaths.dashboard} />
          </Route>
        </Switch>
      </PartnerLayout>
    </DemoDataProvider>
  );
}
