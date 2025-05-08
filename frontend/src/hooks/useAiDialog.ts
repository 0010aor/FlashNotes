import { toaster } from '@/components/ui/toaster'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FlashcardsService } from '@/client'

interface AIUsageQuotaData {
  reset_date: string
  percentage_used: number
}


export function useAiDialog() {
  const { t } = useTranslation()
  const [usageQuota, setUsageQuota] = useState<AIUsageQuotaData>({reset_date: '', percentage_used: 0})

  useEffect(() => {
    const fetchUsageQuota = async () => {
      try {
        const data = await FlashcardsService.getAiUsageQuota()
        if (data) {
          setUsageQuota(data)
        }
      } catch (error) {
        toaster.create({
          title: t('general.errors.errorloadingCard'),
          type: 'error',
        })
      }
    }
    fetchUsageQuota()
  }, [])

  return {
    usageQuota
  }
}
