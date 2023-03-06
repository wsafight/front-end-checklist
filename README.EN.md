# Front-End Checklist

> This article is not a code specification, but it may also limit your code style

In the code of new CR classmates, there are a lot of knowledge and code points that need to be explained repeatedly. Here is an attempt to make a list for the convenience of yourself and others.

## main list
- [ ] Always check for data existence
- [ ] Always check the data type
- [ ] Input validation is required at all times
- [ ] Limits such as max and maximum length need to be added to the input box at any time
- [ ] When writing functions, pay attention to wide entry and strict exit, be tolerant to the received data, and strict to the output data
- [ ] Watch out for the difference of 1 error, always consider the difference between <= and <
- [ ] Prioritize abnormal situations to facilitate real business processing
- [ ] Conditional judgment and loop up to three layers
- [ ] Continue to split functions until the meaning can be expressed in one sentence (one function only completes one function)
- [ ] Don't design all-in-one functions, developers will only write two kinds of code, one with bugs, and the other with bugs in the future
- [ ] Destructuring is preferred whenever
- [ ] Do not process both synchronous and asynchronous data in one statement
- [ ] The return value of the function must be clear, clear, and unified, and it must not appear that there are asynchronous and synchronous results in a function
- [ ] In the hook function, only the call is written, not the specific logic code
- [ ] Do not amplify the impact of the code
- [ ] Don't easily encapsulate duplicate business codes, it may be a coincidence rather than duplication
- [ ] Comments should be focused, data structure comments are very important, followed by unreasonable business logic and then normal functions
- [ ] The variable naming abbreviation must be able to be approved by the team, otherwise use the full word
- [ ] Constant names are all capitalized, and words are separated by underscores, striving for complete and clear semantic expression
- [ ] Function naming uses the form of verb + noun, such as sending SMS sendSms, if it is in a template or jsx, use handle + noun + verb, such as processing SMS sending, handle also has a handle meaning
- [ ] Use object to pass parameters when there are more than 3 function parameters
- [ ] Avoid using boolean parameters, use objects to pass parameters if necessary
- [ ] Try not to use the default export
- [ ] Add useful extra information by adding function intents on the code through words like for, by, from, when
- [ ] Reduce unnecessary data type default conversion and coercion (analyze why the current data is not the data type, instead of converting)
- [ ] Consider whether false 0 '' has the same meaning as null and undefined during Boolean operations
- [ ] In the process of judging, first judge the large-scale, and then make small-scale judgments, such as: authority judgment -> data authority judgment -> business judgment
- [ ] Add parentheses in the judgment of complex Boolean operations to make it easier for others to understand
- [ ] If, else, for, while, do, switch, try, catch, finally, etc., the part of the execution statement must be enclosed in brackets { } no matter how many
- [ ] Do not manually manipulate the DOM easily
- [ ] Add timers, events, etc., remember to clear, otherwise memory leaks or errors may occur
- [ ] When dealing with asynchrony, consider exceptions more. At the same time, Promise must use resolve or reject to enter the next state to avoid code execution stuck
- [ ] Streamline your code by using deletes instead of commenting code
- [ ] Avoid large arrays for query and other operations, use Object, Map or Set for optimization
- [ ] Avoid large amounts of data for recursion
- [ ] Don't use tricks to optimize unless there is a necessary performance requirement
- [ ] HTML tag and attribute operations must limit/filter incoming variable values
- [ ] Attributes one by one, easy to use
- [ ] Never do data modification in render functions
- [ ] Never create random values in render functions (Math.random() Date.now())
- [ ] Never make a network request in a render function
- [ ] Never create new components in render, this will cause React to repeatedly destroy and recreate the child component tree
- [ ] Don't copy the code easily, if necessary, please hand-knock it again to ensure that every line of code that needs to be executed is available
- [ ] The design of the structure should try to consider forward compatibility and future version upgrades, and reserve room for some possible future applications
- [ ] Solving bugs should not only consider the bug itself, but also analyze the causes
- [ ] Do not add modal particles and Internet terms to the information that prompts users, use declarative sentences
- [ ] Do not include insulting words in comments
- [ ] Less references to unnecessary code, whether open source projects can only introduce a part
- [ ] It is recommended not to use ^ ~ etc. in package.json dependencies, it is better to use the current version number directly to avoid project problems caused by dependency upgrades
- [ ] Try not to use inline styles, even if you use props to pass, you must pass the class class within a certain range
- [ ] Pay attention to semantics, use forEach instead of map when operating an array without returning a value, and map will be slower than forEach
- [ ] Use more loops that can be terminated, such as some, every, find, etc. (for an empty array, some returns false, and every returns true)
- [ ] The program should be lazy and never acquire or process data until the last moment
- [ ] Don't use setTimeout to solve asynchronous problems, it will become a non-reproducible (more complicated) bug
- [ ] In the case of logic, try to improve the fault tolerance of the system as much as possible and enhance the robustness
- [ ] Pay attention to the life cycle of things, strictly follow the creation at initialization time, and clean up before the end
- [ ] Improve program robustness with newer language features
- [ ] The limit on the number of lines added to a single file (needs to be customized by the team)
- [ ] Business capabilities do not depend on language features

## to be completed
- [ ] Parsing the meaning of the checklist, explaining why and how
- [ ] Build an official website with the help of tools
- [ ] Promotion, Lifetime Series