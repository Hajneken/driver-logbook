# Testing 

refer to [conventions](https://matheus.ro/2017/09/24/unit-test-naming-convention/)

## Given When Then
> useful in BDD (behaviour-driven-development)

**Given**: This is the starting point for the test. It describes the initial state of the system, and any necessary preconditions that need to be in place in order for the test to be run.

**When**: This describes the action or event that is being tested. It is the trigger that causes the system to change state.

**Then**: This describes the expected outcome of the test. It specifies the conditions that should be true after the "When" event has occurred.

```
Given the user has entered a valid username and password
When the user clicks the login button
Then the user should be logged in and redirected to the home page
```

i.e. `"GivenValidCredentials_WhenUserAttemptsLogin_ThenLoginSuccessful".`

"Given_Preconditions_When_StateUnderTest_Then_ExpectedBehavior"