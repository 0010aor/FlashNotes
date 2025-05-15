import { AIUsageQuota, UsersService } from '@/client'
import { useEffect, useState } from 'react'

export function useAiDialog() {
  const [usageQuota, setUsageQuota] = useState<AIUsageQuota>({
    reset_date: '',
    usage_count: 0,
    max_usage_allowed: 0
  })

  useEffect(() => {
    const fetchUsageQuota = async () => {
      const data = await UsersService.getMyAiUsageQuota()
      setUsageQuota(data)
    }
    fetchUsageQuota()
  }, [])

  return {
    usageQuota,
  }
}
