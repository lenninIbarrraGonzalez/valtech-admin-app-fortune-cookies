import * as React from 'react'
import { useEffect, useState, ChangeEvent } from 'react'
import { Table, Input, Button } from 'vtex.styleguide'

interface FortuneCookie {
  id: string
  text: string
}

interface InfoCookieState {
  data: FortuneCookie[]
  isLoading: boolean
  hasError: boolean
  error: unknown
}

const API_KEY = "vtexappkey-valtech-NFMZFZ"
const API_TOKEN = "LQRXPQPTDBKGKWRVCANKXTPOLKBETQHSZQQQDLHZYQIEAAPAXXOOBBTHDAIVDFHMOJEKONISITNIVXQNAANCBSUMLUWDKTFJLMSFGKVVFRQYYHIISKVRPKSNWSVJQSNR"

const authHeaders: Record<string, string> = {
  "Content-Type": "application/json",
  Accept: "application/json",
  "X-Vtex-Use-Https": "true",
  "X-VTEX-API-AppKey": API_KEY,
  "X-VTEX-API-AppToken": API_TOKEN,
}

const PAGE_SIZE = 10

const AdminPanel: React.FC = () => {
  const [infoCookie, setInfoCookie] = useState<InfoCookieState>({
    data: [],
    isLoading: true,
    hasError: false,
    error: null,
  })
  const [newPhrase, setNewPhrase] = useState<string>('')
  const [saving, setSaving] = useState<boolean>(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [page, setPage] = useState<number>(1)
  const [total, setTotal] = useState<number>(0)

  const fetchData = async (pageNumber: number = 1): Promise<void> => {
    setInfoCookie((prev) => ({ ...prev, isLoading: true }))
    try {
      const from = (pageNumber - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      const timestamp = new Date().getTime()
      const response = await fetch(
        `/api/dataentities/CF/search?_fields=id,CookieFortune&_sort=createdIn DESC&_t=${timestamp}`,
        {
          method: "GET",
          headers: { ...authHeaders, "REST-Range": `resources=${from}-${to}` },
        }
      )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      const totalCount = Number(response.headers.get('rest-content-range')?.split('/')[1] || 0)
      const cookies: FortuneCookie[] = Array.isArray(data)
        ? data
            .filter((item: any) => item.id && item.CookieFortune)
            .map((item: any) => ({
              id: String(item.id),
              text: String(item.CookieFortune),
            }))
        : []

      setInfoCookie({
        data: cookies,
        isLoading: false,
        hasError: false,
        error: null,
      })
      setTotal(totalCount)
    } catch (error) {
      setInfoCookie({
        data: [],
        isLoading: false,
        hasError: true,
        error,
      })
      setTotal(0)
    }
  }

  const onSave = async (): Promise<void> => {
    if (!newPhrase.trim()) return
    setSaving(true)
    setSaveError(null)
    try {
      const response = await fetch('/api/dataentities/CF/documents', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ CookieFortune: newPhrase.trim() }),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      setNewPhrase('')
      setTimeout(() => {
        fetchData(page)
      }, 500)
    } catch (error) {
      setSaveError('No se pudo guardar la frase. Por favor, inténtalo más tarde.')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (id: string): Promise<void> => {
    setDeletingId(id)
    setSaveError(null)
    try {
      const response = await fetch(`/api/dataentities/CF/documents/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      fetchData(page)
    } catch (error) {
      setSaveError('No se pudo eliminar la frase. Por favor, inténtalo más tarde.')
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    fetchData(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const schema = {
    properties: {
      text: {
        title: 'Frase', // Texto estático
        width: 750,
        cellRenderer: ({ rowData }: { rowData: FortuneCookie }) => (
          <span>{rowData.text}</span>
        ),
      },
      actions: {
        title: 'Eliminar', // Texto estático
        width: 120,
        cellRenderer: ({ rowData }: { rowData: FortuneCookie }) => (
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
          onClick={onSave}
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
