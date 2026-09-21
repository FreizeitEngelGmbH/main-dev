import { registerIntegrationMock } from "./_integrationFactory";

registerIntegrationMock("regiondo", [
  {
    path: "products",
    sample: (partnerId) => [
      { id: `regiondo-prod-${partnerId}-1`, name: "Tagesticket", price: 15 },
      { id: `regiondo-prod-${partnerId}-2`, name: "Gruppenticket (ab 6 Pers.)", price: 12 },
    ],
  },
]);
