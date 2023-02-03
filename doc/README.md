# Documentation 

* `design`: UML diagrams, architecture, sequence diagrams, use-cases 
* `presentation`: Final Presentation 
* `report`: PDF report 
* `screenshots`: Snapshot images of the App in different stages
* `testing` : document listing manually carried out E2E test scenarios 

---

## User Jorney

```mermaid
journey
    title Joruney
    section Application
      Open App: 5: User
      Tap New Journey: 4: User
      Take a picture of odometer: 3: User
      Confirm recognized odometer state: 3: User
      Drive: 5: User 
      Tap End Joruney :5: User
      Take a picture of odometer: 4: User
      Confirm recognized odometer state: 3: User
      Exit App : 5 :User 
```

---

## Time Plan

```mermaid
gantt
    title Prospective Schedule (Gantt)
    dateFormat  YYYY-MM-DD
    section Concept
    Concept           :a1, 2022-10-20, 20d
    section Implementation (IMPL)
    Prototype      :2022-11-07  , 15d
    Core      :2022-11-21 , 55d
    Final      :2023-01-14 , 10d
    section Report
    Report  :2023-01-23, 7d
    pres (pres) : 2d
```