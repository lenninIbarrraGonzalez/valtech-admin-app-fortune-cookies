import * as React from 'react'
import { useEffect, useState } from 'react'
import { Table } from 'vtex.styleguide'
import { useIntl } from 'react-intl'

// Tipos y interfaces
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
      // Validación: asegurarse que data es un array y tiene los campos requeridos
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
      <Table
        fullWidth
        items={infoCookie.data}
        schema={schema}
        density="low"
        loading={infoCookie.isLoading}
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
