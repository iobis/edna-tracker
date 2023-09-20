# edna-tracker

<https://samples.ednaexpeditions.org/>

## Data sources

```
                 ┌──────────┐
                 │          │ upload
                 │ pipeline ├───────────┐
                 │          │           │
                 └──────────┘           │
                                        ▼
┌─────────┐      ┌──────────┐      ┌──────────┐
│         │      │   MWHS   │      │   eDNA   │
│   OBIS  ├─────►│   OBIS   ├─────►│  species ├───────────┐
│         │      │  species │      │   lists  │           │
└─────────┘      └──────────┘      └──────────┘           │
                  action            action                ▼
                 ┌──────────┐      ┌──────────┐      ┌──────────┐
                 │          │      │   eDNA   │      │   eDNA   │
                 │  PlutoF  ├─────►│  tracker ├─────►│  tracker │
                 │          │      │   data   │      │          │
                 └──────────┘      └──────────┘      └──────────┘
                                    action                  React
```

- <https://github.com/iobis/edna-tracker-data>
- <https://github.com/iobis/mwhs-obis-species>
- <https://github.com/iobis/edna-species-lists> (private)
