# End-to-end testing scenarios

The following document lists carried out test scenarios. All tests are categorized by the platform of execution. Each test has preconditions to be fulfilled before following described steps. Each test is labelled with priority and success (all tests were carried out successfully). 

- [End-to-end testing scenarios](#end-to-end-testing-scenarios)
  - [Emulator](#emulator)
    - [Sign In](#sign-in)
    - [Start App in Normal Mode](#start-app-in-normal-mode)
    - [Create Trip in Experimental Mode](#create-trip-in-experimental-mode)
    - [Create Trip in Experimental Mode (previous trips available)](#create-trip-in-experimental-mode-previous-trips-available)
    - [Create Trip In Normal Mode](#create-trip-in-normal-mode)
    - [Export Trips](#export-trips)
    - [Export trips, no trips](#export-trips-no-trips)
  - [Physical Device](#physical-device)
    - [Sign In](#sign-in-1)
    - [Start App in Normal Mode](#start-app-in-normal-mode-1)
    - [Create Trip In Normal Mode](#create-trip-in-normal-mode-1)
    - [Create Trip in Experimental Mode](#create-trip-in-experimental-mode-1)
    - [Create Trip in Experimental Mode (previous trips available)](#create-trip-in-experimental-mode-previous-trips-available-1)
    - [Export Trips](#export-trips-1)
    - [Export trips, no trips](#export-trips-no-trips-1)
  
## Emulator

### Sign In

Device: Android (emulated)
Passed: Yes
Priority: Critical

Preconditions: 

- None
- repeat in demo mode | no mode activated | experimental mode

Steps: 

1. Start App
2. Fill In arbitrary data to the fields 
3. Tap on Sign In → should redirect to the overview page

### Start App in Normal Mode

Device: Android (emulated)
Passed: Yes
Priority: Critical

Preconditions:

- Demo Mode is turned off on init
- Database is empty

Steps: 

1. Press Sign In → there should be no trips
2. Press Saved Places → there should be no saved places
3. Press Profile 
4. Press Settings → demo mode should be turned off

### Create Trip in Experimental Mode

Device: Android (emulated)
Passed: Yes
Priority: Important

Preconditions:

- Demo Mode is Turned Off
- Experimental Mode is Turned On
- Database is empty
    - no trips
    - no saved places

Steps:

1. Tap New Trip 
2. Tap Camera Trigger Button
3. Tap USE
4. Recognition should fail → assigns odometer start to 0
5. Wait in Trip In progress for 10s
6. Tap End Trip
7. Tap Retake button
8. Tap Camera Trigger Button
9. Tap Use → Should be rejected 

Test ends here as it is not possible to simulate picture of end odometer on the simulator.

### Create Trip in Experimental Mode (previous trips available)

Device: Android (emulated)
Passed: Yes
Priority: Important

Preconditions:

- Database has trips and places (Application started in demo mode)
- Demo Mode is Turned Off after initial Login
- Experimental Mode is Turned On

Steps:

1. Tap New Trip 
2. Tap Camera Trigger Button
3. Tap USE
4. Recognition should take end odometer of the previous trip (1900)
5. Wait 10s on the trip progress page 
6. Tap End Trip 
7. Tap Camera Trigger Button
8. Tap USE
9. Recognition should fail → Snackbar appears asking to try again 

Test ends here because on Emulator the image can’t be properly simulated.

### Create Trip In Normal Mode

Device: Android (emulated)
Note: masking does not allow for inputting negative values (5)
Passed: Yes
Priority: Critical

Preconditions:

- Demo Mode is Turned Off
- Database is empty
    - no trips
    - no saved places

Steps:

1. Tap New Trip 
2. Tap Camera Trigger Button
3. Tap USE
4. Recognition should Fail
5. Select Field Custom Value and Insert value -300 → should reject
6. Select Field Custom Value and Insert value 123456 → should accept
7. Tap Confirm Selection
8. Wait in progress Screen 10s
9. Tap End Trip 
10. Tap Retake
11. Tap Use
12. Recognition should Fail
13. Select Field Custom Value and Insert value 123455 → should be rejected
14. Select Field Custom Value and Insert value 123457 → should be accepted
15. Tap edit Start Location → there should be no option to select
16. Tap edit End Location → There should be no option to select
17. Tap edit Start Odometer → Insert Value 123458 → Should be rejected
18. Tap edit Start Odometer → Insert Value 123454 → Should be Accepted
19. Tap edit Start Time → Insert value 1 hour after end time → Should be Rejected
20. Tap edit Start Time → Insert value 1 hour before original start time → should be accepted
21. Tap edit End Time → Insert value 1 hour before start time → should be rejected
22. Tap edit End Time → Insert value 1 hour after original end time → should be accepted
23. Tap Confirm
24. Trip should be listed in Trips as #1

### Export Trips

Device: Android (emulated)
Passed: Yes
Priority: Moderate

preconditions:

- existing trips (start in demo mode)
- database is not empty

steps: 

1. Log In
2. Tap Export Icon
3. Tap Export Trips in CSV 
4. Save on device 
5. Check saved file → should contain Trips in CSV file
6. Tap Export Trips in JSON
7. Save on device 
8. Check saved file → should contain Trips in JSON file

### Export trips, no trips

Device: Android (emulated)
Passed: Yes
Priority: Moderate

Preconditions:

- Database empty

Steps: 

1. Create a favorite location name: “Test” address: “Test”
2. Create New Trip with custom start or end location modified in Trip Summary
3. Tap Export Button
4. Tap Export as CSV
5. Save and check if trip has start/end location “test”
6. Repeat step 4 and Tap Export as JSON
7. Repeat step 5


## Physical Device

### Sign In

Device: iOS (physical)
Passed: Yes
Priority: Critical

Preconditions: 

- None
- repeat in demo mode | no mode activated | experimental mode

Steps: 

1. Start App
2. Fill In arbitrary data to the fields 
3. Tap on Sign In → should redirect to the overview page

### Start App in Normal Mode

Device: iOS (physical)
Passed: Yes
Priority: Critical

Preconditions:

- Demo Mode is turned off on init
- Database is empty

Steps: 

1. Press Sign In → there should be no trips
2. Press Saved Places → there should be no saved places
3. Press Profile 
4. Press Settings → demo mode should be turned off

### Create Trip In Normal Mode

Device: iOS (physical)
Passed: Yes
Priority: Critical

Preconditions:

- Demo Mode is Turned Off
- Database is empty
    - no trips
    - no saved places

Steps:

1. Tap New Trip 
2. write down -300
3. Tap Camera Trigger Button to pohotograph -300
4. Tap USE
5. Recognition should either Fail or return 300
6. 300 should not pass as a value (expected is 000300)
7. type 000300 custom value
8. Tap Confirm Selection
9. Wait in progress Screen 10s
10. Tap End Trip 
11. Tap Retake
12. Write 000301
13. Recognition should return 000301
14. Select custom value and type 000001 and confirm → value should be rejected 
15. select recognized value 000301 and confirm
16. Tap edit Start Location → there should be no option to select
17. Tap edit End Location → There should be no option to select
18. Tap edit Start Odometer → Insert Value 123458 → Should be rejected
19. Tap edit Start Odometer → Insert Value 299 → Should be Accepted and updated
20. Tap edit End Odometer → insert value 100 → Should be rejected
21. Tap edit End Odometer → insert value 400 → should be accepted and updated
22. Tap edit Start Time → Insert value 1 hour after end time → Should be Rejected
23. Tap edit Start Time → Insert value 1 hour before original start time → should be accepted
24. Tap edit End Time → Insert value 1 hour before start time → should be rejected
25. Tap edit End Time → Insert value 1 hour after original end time → should be accepted
26. Tap Confirm
27. Trip should be listed in Trips as #1


### Create Trip in Experimental Mode

Device: iOS (physical)
Passed: Yes
Priority: Important

Preconditions:

- Demo Mode is Turned Off
- Experimental Mode is Turned On
- Database is empty
    - no trips
    - no saved places

Steps:

1. Tap New Trip 
2. Tap Camera Trigger Button
3. Tap USE
4. Recognition should Fail → should set starting value of odometer to 0
5. Wait for 10s on In Progress Screen
6. Tap End Trip Button
7. Tap USE → should fail with a prompt that asks to try again
8. Write down any value e.g. 000300 and photograph it by tapping camera trigger button
9. Tap USE
10. Confirm Values by tapping Confirm button
11. Overview should contain the new trip



### Create Trip in Experimental Mode (previous trips available)

Device: iOS (physical)
Passed: Yes
Priority: Important

Preconditions:

- Demo Mode is Turned Off after initial Login
- Experimental Mode is Turned On
- Database has trips and places

Steps:

1. Tap New Trip 
2. Tap Camera Trigger Button and photograph numerical text smaller than any other previous trip odometer end value e.g. 000001
3. Tap USE → should take end odometer value of the previous trip
4. Wait 10s on the trip progress page 
5. Tap End Trip 
6. Tap Camera Trigger Button and photograph numerical text of 1 smaller than previous one e.g. 000001 
7. Tap USE → should fail with a Snackbar prompt to try again
8. Tap Camera Trigger Button and photograph numerical text of 1 bigger than previous one e.g. 333333 
9. Tap USE → should pass
10. Confirm Values in Trip Summary by tapping Confirm
11. When redirected to the Overview screen the trip should be visible

### Export Trips

Device: iOS (physical)
Passed: Yes
Priority: Moderate

preconditions:

- existing trips (start in demo mode)
- database is not empty

steps: 

1. Log In
2. Tap Export Icon
3. Tap Export Trips in CSV 
4. Save on device 
5. Check saved file → should contain Trips in CSV file
6. Tap Export Trips in JSON
7. Save on device 
8. Check saved file → should contain Trips in JSON file

### Export trips, no trips

Device: iOS (physical)
Passed: Yes
Priority: Moderate

Preconditions:

- Database empty

Steps: 

1. Create a favorite location name: “Test” address: “Test”
2. Create New Trip with custom start or end location
3. Tap Export Button
4. Tap Export as CSV
5. Save and check if trip has start/end location “test”

