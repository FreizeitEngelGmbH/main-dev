import { registerIntegrationMock } from "./_integrationFactory";

registerIntegrationMock(
  "pretix",
  [
    {
      path: "items",
      sample: (partnerId) => [
        { id: `pretix-item-${partnerId}-1`, name: "Tagesticket Erwachsene", price: 12 },
        { id: `pretix-item-${partnerId}-2`, name: "Tagesticket Kinder", price: 8 },
      ],
    },
    {
      path: "quotas",
      sample: (partnerId) => [{ id: `pretix-quota-${partnerId}-1`, name: "Tageskontingent", size: 300, available: 214 }],
    },
  ],
  { apiInfo: true }
);
