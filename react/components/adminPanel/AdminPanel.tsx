import React, { useEffect, ChangeEvent, useState } from 'react'
import { Table, Input, Button } from 'vtex.styleguide'
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
    fetchData,
  } = useFortuneCookies()

  const [newPhrase, setNewPhrase] = useState<string>('')

  useEffect(() => {
    fetchData(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const schema = {
    properties: {
      text: {
        title: 'Frase',
        width: 750,
        cellRenderer: ({ rowData }: { rowData: { text: string } }) => (
          <span>{rowData.text}</span>
        ),
      },
      actions: {
        title: 'Eliminar',
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
              Borrar
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
      <div className="flex items-center mb3 gap2">
        <Input
          value={newPhrase}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPhrase(e.target.value)}
          placeholder="Escribe una nueva frase"
          size="regular"
          disabled={saving}
          className="w-50 mr3"
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
          Guardar
        </Button>
      </div>
      {saveError && (
        <div className="dark-red mb3 f6">
          {saveError}
        </div>
      )}

      <Table
        fullWidth
        items={infoCookie.data}
        schema={schema}
        density="low"
        loading={infoCookie.isLoading}
        updateTableKey={infoCookie.data.length}
        emptyStateLabel="No hay frases"
        emptyStateChildren={
          <span className="c-muted-1">
            {infoCookie.hasError
              ? "Ocurrió un error al cargar las frases"
              : "No hay frases disponibles"}
          </span>
        }
        pagination={{
          currentItemFrom: from + 1,
          currentItemTo: to,
          onNextClick: () => setPage(prev => prev + 1),
          onPrevClick: () => setPage(prev => prev - 1),
          textShowRows: "Mostrar filas",
          textOf: "de",
          totalItems: total,
        }}
      />
    </>
  )
}

export default AdminPanel
