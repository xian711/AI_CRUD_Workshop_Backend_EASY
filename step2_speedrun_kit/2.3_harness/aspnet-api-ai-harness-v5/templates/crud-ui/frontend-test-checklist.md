# Frontend CRUD Test Checklist

| ID | Scenario | Expected |
|---|---|---|
| F01 | load page | list API called and table rendered |
| F02 | search by keyword | query sent to API and table updated |
| F03 | create with valid data | create API called and list refreshed |
| F04 | create with missing required field | validation message shown |
| F05 | edit existing row | update API called and list refreshed |
| F06 | delete row | confirm shown, delete API called after confirm |
| F07 | API validation error | error shown using existing Toast / Alert |
| F08 | no permission | action hidden or disabled according to rule |
