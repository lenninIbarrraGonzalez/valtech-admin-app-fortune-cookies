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
      fetchData()
    } catch (error) {
      setSaveError('No se pudo guardar la frase. Por favor, inténtalo más tarde.')
    } finally {
      setSaving(false)
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
        width: 800,
        cellRenderer: ({ rowData }: { rowData: FortuneCookie }) => (
          <span>{rowData.text}</span>
        ),
      },
    },
  } as const

  return (
    <>

      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <Input
          value={newPhrase}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPhrase(e.target.value)}
          placeholder={intl.formatMessage({ id: 'admin/fortune-cookies.input-placeholder'})}
          size="regular"
          disabled={saving}
        />
        <Button
          variation="primary"
          onClick={onSave}
          isLoading={saving}
          disabled={saving || !newPhrase.trim()}
        >
          {intl.formatMessage({ id: 'admin/fortune-cookies.save-button'})}
        </Button>
      </div>
      {saveError && (
        <div style={{ color: '#e13219', marginBottom: 16, fontSize: 14 }}>
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
