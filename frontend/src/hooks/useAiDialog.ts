import { FlashcardsService } from '@/client'
import { useEffect, useState } from 'react'

interface AIUsageQuotaData {
  reset_date: string
  percentage_used: number
}

export function useAiDialog() {
  const [usageQuota, setUsageQuota] = useState<AIUsageQuotaData>({
    reset_date: '',
    percentage_used: 0,
  })

  useEffect(() => {
    const fetchUsageQuota = async () => {
      const data = await FlashcardsService.getAiUsageQuota()
      setUsageQuota(data)
    }
    fetchUsageQuota()
  }, [])

  return {
    usageQuota,
  }
}
