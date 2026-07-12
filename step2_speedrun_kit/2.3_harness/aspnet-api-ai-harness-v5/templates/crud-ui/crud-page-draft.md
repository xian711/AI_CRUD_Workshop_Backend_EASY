# CRUD Page Draft

Use this as a compact page draft before generating framework-specific code.

## Page Structure

```text
<Page>
  <SearchArea />
  <Toolbar>
    <CreateButton />
  </Toolbar>
  <DataTable />
  <Pagination />
  <CreateEditDialog />
  <DeleteConfirmDialog />
</Page>
```

## Data State

- searchModel
- tableRows
- pagination
- selectedRow
- formModel
- formErrors
- loading

## Methods

- loadList()
- openCreate()
- openEdit(row)
- submitForm()
- confirmDelete(row)
- deleteRow()
- resetSearch()

## Verification

- Search triggers list API.
- Create / edit validates required fields.
- Delete requires confirmation.
- API errors show existing Toast / Alert component.
