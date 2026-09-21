import { registerIntegrationMock } from "./_integrationFactory";

registerIntegrationMock("roller", [
  {
    path: "products",
    sample: (partnerId) => [
      { id: `roller-prod-${partnerId}-1`, name: "Bowling Bahn (1 Std.)", price: 18.5 },
      { id: `roller-prod-${partnerId}-2`, name: "Schuhverleih", price: 3 },
    ],
  },
]);
