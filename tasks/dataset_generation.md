# STEP 1 — Event Simulation with Group-Specific Seed

Every group gets a fixed integer:

```
GROUP_ID = 3
SEED = 1000 + GROUP_ID
```

### Minimal working generator:

```python
import numpy as np
import pandas as pd
import random

GROUP_ID = 3
SEED = 1000 + GROUP_ID

np.random.seed(SEED)
random.seed(SEED)

N_EVENTS = 5000

users = [f"user_{i}" for i in range(100)]
devices = [f"device_{i}" for i in range(50)]
regions = ["AU", "US", "UK"]

data = []

for i in range(N_EVENTS):
    event = {
        "timestamp": pd.Timestamp("2025-01-01") + pd.Timedelta(minutes=i),
        "user_id": random.choice(users),
        "device_id": random.choice(devices),
        "region": random.choice(regions),
        "watch_minutes": np.random.poisson(5)
    }
    data.append(event)

df = pd.DataFrame(data)
df.to_csv("events.csv", index=False)
```

That is it.

Because seed differs → every group gets different:

* user distribution
* device distribution
* region pattern
* Poisson values

But reproducible.

---

# STEP 2 — Inject Unique Abnormal Scenario

Now anomaly must be deterministic based on group.

Example rule:

```
ANOMALY_TYPE = GROUP_ID % 3
```

---

## Case 0 – Volume Spike

```python
if ANOMALY_TYPE == 0:
    spike = pd.DataFrame({
        "timestamp": pd.Timestamp("2025-01-02 12:00:00"),
        "user_id": ["user_1"] * 500,
        "device_id": ["device_1"] * 500,
        "region": ["AU"] * 500,
        "watch_minutes": np.random.poisson(20, 500)
    })
    df = pd.concat([df, spike])
```

---

## Case 1 – Shared Device

```python
if ANOMALY_TYPE == 1:
    shared_device = "device_shared"
    df.loc[0:50, "device_id"] = shared_device
```

Now 50 users connected through one device → graph cluster.

---

## Case 2 – Cross-Region IP Pattern

Add fake IP column first:

```python
df["ip"] = np.random.randint(1, 255, size=len(df))
```

Inject:

```python
if ANOMALY_TYPE == 2:
    df.loc[100:150, "ip"] = 999
    df.loc[100:125, "region"] = "AU"
    df.loc[126:150, "region"] = "US"
```

Same IP in different regions → suspicious.

---

# Why This Works

Each group:

* Has different base distribution (seed)
* Has different anomaly type (mod rule)
* Has different magnitude pattern

If two groups copy:

* Seed mismatch detectable
* Cluster structure mismatch
* Spike window mismatch

You can regenerate their dataset using their group ID and verify.

---
