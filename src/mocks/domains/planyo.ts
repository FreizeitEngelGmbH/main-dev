import { registerIntegrationMock } from "./_integrationFactory";
import { registerMock } from "../mockEngine";

registerIntegrationMock("planyo", [
  {
    path: "resources",
    sample: (partnerId) => [
      { id: `planyo-res-${partnerId}-1`, name: "Bahn A (18 Loch)", capacity: 4 },
      { id: `planyo-res-${partnerId}-2`, name: "Bahn B (18 Loch)", capacity: 4 },
    ],
  },
]);

registerMock("POST", "/api/planyo/api-estimate", () => ({ estimatedCalls: 0, message: "Lokal — keine echten API-Aufrufe." }));
