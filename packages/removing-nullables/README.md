# Removing nullables
 
This directory contains the full code for the [Removing nullables](https://scbird.hashnode.dev/series/removing-nullables) blog series. Part 1 is an introductory article and doesn't contain any code. 

## [Part 2](./part2_document-printer) - Request document logger

A very basic Apollo plugin that logs the request document, listing the fields that have been requested. [Article link](https://scbird.hashnode.dev/creating-a-simple-apollo-server-plugin) 


## [Part 3](./part3_types-printer) - Type logger

Extends the plugin from [Part 2](./part2_document-printer) to also display the possible types each field could be
 
## [Part 4](./part4_nonnullable-violations-reporter) - @proposedNonNullable violation logger

Extends the plugin in [Part 3](./part3_types-printer) to check the response document for values that are `null` but are from a field that has been declared as `@proposedNonNullable` 

## [Part 5](./part5_including_operation_data) - Final plugin

Extends the plugin in [Part 4](./part4_nonnullable-violations-reporter) to report the specific details of the operation when a violation has been detected. 
