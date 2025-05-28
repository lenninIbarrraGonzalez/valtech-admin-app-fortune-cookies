import React, { ChangeEvent, useState } from 'react'
import { Table, Input, Button } from 'vtex.styleguide'
import { useIntl } from 'react-intl'
import { useFortuneCookies } from '../../hooks/useFortuneCookies'

const AdminPanel: React.FC = () => {
  const {
    infoCookie,
    total,
    page,
    setPage,
    saving,
    saveError,
    deletingId,
    onSave,
    onDelete,
    PAGE_SIZE,
    deletingAll,
    deleteAllError,
    onDeleteAll,
  } = useFortuneCookies()
  const intl = useIntl()
  const [newPhrase, setNewPhrase] = useState<string>('')

  const schema = {
    properties: {
      text: {
        title: intl.formatMessage({ id: 'admin/fortune-cookies.title-column' }),
        width: 750,
        cellRenderer: ({ rowData }: { rowData: { text: string } }) => (
          <span>{rowData.text}</span>
        ),
      },
      actions: {
        title: intl.formatMessage({ id: 'admin/fortune-cookies.title-delete' }),
        width: 120,
        cellRenderer: ({ rowData }: { rowData: { id: string } }) => (
          <div className="flex items-center justify-center">
            <Button
              variation="danger"
              size="small"
              isLoading={deletingId === rowData.id}
              onClick={() => onDelete(rowData.id)}
              disabled={deletingId !== null && deletingId !== rowData.id}
            >
              {intl.formatMessage({ id: 'admin/fortune-cookies.delete-button' })}
            </Button>
          </div>
        ),
      },
    },
  } as const

  const from = (page - 1) * PAGE_SIZE
  const to = Math.min(from + PAGE_SIZE, total)

  return (
    <>
      <div className="flex items-center mb3" style={{ gap: '5px' }}>
        <Input
          value={newPhrase}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPhrase(e.target.value)}
          placeholder={intl.formatMessage({ id: 'admin/fortune-cookies.empty-state-message', defaultMessage: 'Escribe una nueva frase' })}
          size="regular"
          disabled={saving}
          className="w-50 mr4"
        />
        <Button
          variation="primary"
          onClick={() => {
            if (newPhrase.trim()) {
              onSave(newPhrase.trim())
              setNewPhrase('')
            }
          }}
          isLoading={saving}
          disabled={saving || !newPhrase.trim()}
          className="w-auto"
        >
          {intl.formatMessage({ id: 'admin/fortune-cookies.save-button', defaultMessage: 'Guardar' })}
        </Button>
      </div>

      <Table
        fullWidth
        items={infoCookie.data}
        schema={schema}
        density="low"
        loading={infoCookie.isLoading}
        updateTableKey={infoCookie.data.length}
        emptyStateLabel={intl.formatMessage({ id: 'admin/fortune-cookies.empty-state-text' })}
        emptyStateChildren={
          <span className="c-muted-1">
            {infoCookie.hasError
              ? intl.formatMessage({ id: 'admin/fortune-cookies.error-state-message' })
              : intl.formatMessage({ id: 'admin/fortune-cookies.empty-state-message' })}
          </span>
        }
        pagination={{
          currentItemFrom: from + 1,
          currentItemTo: to,
          onNextClick: () => setPage(prev => prev + 1),
          onPrevClick: () => setPage(prev => prev - 1),
          textShowRows: intl.formatMessage({ id: 'admin/fortune-cookies.textShowRows-paginatio' }),
          textOf: intl.formatMessage({ id: 'admin/fortune-cookies.of-pagination' }),
          totalItems: total,
        }}
      />

      <div className="mt6 flex justify-center">
        <Button
          variation="danger"
          onClick={onDeleteAll}
          isLoading={deletingAll}
          disabled={infoCookie.data.length === 0 || deletingAll}
        >
          {intl.formatMessage({ id: 'admin/fortune-cookies.deleteAllFortuneCookies' })}
        </Button>
      </div>

      {deleteAllError && (
        <div className="dark-red mb3 f6 tc">
          {deleteAllError}
        </div>
      )}

      {saveError && (
        <div className="dark-red mb3 f6">
          {saveError}
        </div>
      )}
    </>
  )
}

export default AdminPanel
