import { useState, useCallback } from 'react'
import { InfoCookieState } from '../types/fortuneCookies'
import { fetchFortuneCookies, saveFortuneCookie, deleteFortuneCookie } from '../services/fortuneCookiesService'

const PAGE_SIZE = 10

export function useFortuneCookies() {
  const [infoCookie, setInfoCookie] = useState<InfoCookieState>({
    data: [],
    isLoading: true,
    hasError: false,
    error: null,
  })
  const [total, setTotal] = useState<number>(0)
  const [page, setPage] = useState<number>(1)
  const [saving, setSaving] = useState<boolean>(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchData = useCallback(async (pageNumber: number = 1) => {
    setInfoCookie((prev) => ({ ...prev, isLoading: true }))
    try {
      const from = (pageNumber - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      const { cookies, total } = await fetchFortuneCookies(from, to)
      setInfoCookie({
        data: cookies,
        isLoading: false,
        hasError: false,
        error: null,
      })
      setTotal(total)
    } catch (error) {
      setInfoCookie({
        data: [],
        isLoading: false,
        hasError: true,
        error,
      })
      setTotal(0)
    }
  }, [])

  const onSave = useCallback(async (text: string) => {
    setSaving(true)
    setSaveError(null)
    try {
      await saveFortuneCookie(text)
      setTimeout(() => fetchData(page), 500)
    } catch {
      setSaveError('No se pudo guardar la frase. Por favor, inténtalo más tarde.')
    } finally {
      setSaving(false)
    }
  }, [fetchData, page])

  const onDelete = useCallback(async (id: string) => {
    setDeletingId(id)
    setSaveError(null)
    try {
      await deleteFortuneCookie(id)
      fetchData(page)
    } catch {
      setSaveError('No se pudo eliminar la frase. Por favor, inténtalo más tarde.')
    } finally {
      setDeletingId(null)
    }
  }, [fetchData, page])

  return {
    infoCookie,
    total,
    page,
    setPage,
    saving,
    saveError,
    deletingId,
    onSave,
    onDelete,
    fetchData,
    PAGE_SIZE,
  }
}
