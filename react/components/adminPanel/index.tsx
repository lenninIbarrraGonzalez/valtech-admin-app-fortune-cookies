import * as React from 'react'
import { useEffect, useState } from 'react'
import { Table, Input, Button } from 'vtex.styleguide';
import { useIntl } from 'react-intl'

interface FortuneCookie {
  id: string
  text: string
}

interface InfoCookieState {
  data: FortuneCookie[]
  isLoading: boolean
  hasError: boolean
  error: any
}

const API_KEY = "vtexappkey-valtech-NFMZFZ"
const API_TOKEN = "LQRXPQPTDBKGKWRVCANKXTPOLKBETQHSZQQQDLHZYQIEAAPAXXOOBBTHDAIVDFHMOJEKONISITNIVXQNAANCBSUMLUWDKTFJLMSFGKVVFRQYYHIISKVRPKSNWSVJQSNR"

const authHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
  "X-Vtex-Use-Https": "true",
  "X-VTEX-API-AppKey": API_KEY,
  "X-VTEX-API-AppToken": API_TOKEN,
}

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
  const intl = useIntl()

  const fetchData = async () => {
    try {
      const timestamp = new Date().getTime()
      const response = await fetch(
        `/api/dataentities/CF/search?_fields=id,CookieFortune&_sort=createdIn DESC&_t=${timestamp}`,
        {
          method: "GET",
          headers: { ...authHeaders, "REST-Range": "resources=0-400" },
        }
      )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
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
    } catch (error) {
      setInfoCookie({
        data: [],
        isLoading: false,
        hasError: true,
        error,
      })
    }
  }

  const onSave = async () => {
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
        fetchData()
      }, 500)
    } catch (error) {
      setSaveError('No se pudo guardar la frase. Por favor, inténtalo más tarde.')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async (id: string) => {
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
      fetchData()
    } catch (error) {
      setSaveError('No se pudo eliminar la frase. Por favor, inténtalo más tarde.')
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const schema = {
    properties: {
      text: {
        title: intl.formatMessage({ id: 'admin/fortune-cookies.title-column' }),
        width: 750,
        cellRenderer: ({ rowData }: { rowData: FortuneCookie }) => (
          <span>{rowData.text}</span>
        ),
      },
      actions: {
        title: intl.formatMessage({ id: 'admin/fortune-cookies.title-delete' }),
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
              {intl.formatMessage({
                id: 'admin/fortune-cookies.delete-button',
                defaultMessage: 'Delete',
              })}
            </Button>
          </div>
        ),
      },
    },
  } as const

  return (
    <>
      <div className="flex items-center mb3 gap2">
        <Input
          value={newPhrase}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPhrase(e.target.value)}
          placeholder={intl.formatMessage({ id: 'admin/fortune-cookies.input-placeholder'})}
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
          {intl.formatMessage({ id: 'admin/fortune-cookies.save-button'})}
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
        emptyStateLabel={intl.formatMessage({ id: 'admin/fortune-cookies.empty-state-text' })}
        emptyStateChildren={
          <span className="c-muted-1">
            {infoCookie.hasError
              ? intl.formatMessage({ id: 'admin/fortune-cookies.error-state-message' })
              : intl.formatMessage({ id: 'admin/fortune-cookies.empty-state-message' })}
          </span>
        }
      />
    </>
  )
}

export default AdminPanel
