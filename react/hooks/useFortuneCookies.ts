import { useState, useCallback, useEffect } from 'react'
import { InfoCookieState } from '../types/fortuneCookies'
import {
  fetchFortuneCookies,
  saveFortuneCookie,
  deleteFortuneCookie,
  fetchWithRetryUntilFound
} from '../services/fortuneCookiesService'

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
  const [deletingAll, setDeletingAll] = useState<boolean>(false)
  const [deleteAllError, setDeleteAllError] = useState<string | null>(null)

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
      setPage(1)
      const { cookies, total: newTotal } = await fetchWithRetryUntilFound(0, PAGE_SIZE - 1, text)

      setInfoCookie({
        data: cookies,
        isLoading: false,
        hasError: false,
        error: null,
      })
      setTotal(newTotal)
    } catch (error) {
      console.error('Error saving fortune cookie:', error)
      setSaveError('The sentence could not be saved. Please try again later.')
    } finally {
      setSaving(false)
    }
  }, [])

  const onDelete = useCallback(async (id: string) => {
    setDeletingId(id)
    setSaveError(null)
    try {
      await deleteFortuneCookie(id)

      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      const { cookies, total: newTotal } = await fetchWithRetryUntilFound(from, to)

      setInfoCookie({
        data: cookies,
        isLoading: false,
        hasError: false,
        error: null,
      })
      setTotal(newTotal)
    } catch (error) {
      console.error('Error deleting fortune cookie:', error)
      setSaveError('The sentence could not be deleted. Please try again later.')
    } finally {
      setDeletingId(null)
    }
  }, [page])

  const getAllCookieIds = async (): Promise<string[]> => {
    let allIds: string[] = []
    let from = 0
    const pageSize = 100
    let keepFetching = true

    while (keepFetching) {
      const { cookies, total } = await fetchFortuneCookies(from, from + pageSize - 1)
      allIds = allIds.concat(cookies.map(cookie => cookie.id))
      from += pageSize
      if (allIds.length >= total) {
        keepFetching = false
      }
    }
    return allIds
  }

  const onDeleteAll = useCallback(async () => {
    setDeleteAllError(null)
    const confirmDelete = window.confirm('¿Estás seguro de que deseas borrar todas las galletas de la fortuna?')
    if (!confirmDelete) {
      return
    }
    setDeletingAll(true)
    try {
      const allIds = await getAllCookieIds()
      await Promise.all(allIds.map(id => deleteFortuneCookie(id)))
      setPage(1)
      const { cookies, total: newTotal } = await fetchWithRetryUntilFound(0, PAGE_SIZE - 1)
      setInfoCookie({
        data: cookies,
        isLoading: false,
        hasError: false,
        error: null,
      })
      setTotal(newTotal)
    } catch (error) {
      console.error('Error deleting all fortune cookies:', error)
      setDeleteAllError('The sentences could not be deleted. Please try again later.')
    } finally {
      setDeletingAll(false)
    }
  }, [])

  useEffect(() => {
    fetchData(page)
  }, [page, fetchData])

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
    deletingAll,
    deleteAllError,
    onDeleteAll,
  }
}
