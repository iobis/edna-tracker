# edna-tracker

<https://samples.ednaexpeditions.org/>

## Data sources

```
                  ┌──────────┐
                  │   eDNA   │
                  │  species ├───────────┐
                  │   lists  │           │
                  └──────────┘           │
                   action                ▼
┌──────────┐      ┌──────────┐      ┌──────────┐
│          │      │   eDNA   │      │   eDNA   │
│  PlutoF  ├─────►│  tracker ├─────►│  tracker │
│          │      │   data   │      │          │
└──────────┘      └──────────┘      └──────────┘
 data entry        action                ▲ React
                  ┌──────────┐           │
                  │   MWHS   │           │
                  │   OBIS   ├───────────┘
                  │  species │
                  └──────────┘
                   action
```

- <https://github.com/iobis/edna-tracker-data>
- <https://github.com/iobis/mwhs-obis-species>
