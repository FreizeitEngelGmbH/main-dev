import { registerIntegrationMock } from "./_integrationFactory";

registerIntegrationMock(
  "eversport",
  [
    {
      path: "sessions",
      sample: (partnerId) => [
        { id: `eversport-sess-${partnerId}-1`, name: "Boulderkurs Anfänger", start: new Date(Date.now() + 86400000).toISOString(), spotsLeft: 4 },
        { id: `eversport-sess-${partnerId}-2`, name: "Freies Klettern", start: new Date(Date.now() + 2 * 86400000).toISOString(), spotsLeft: 12 },
      ],
    },
  ],
  { apiInfo: true }
);
