import { MAX_CHARACTERS } from '@/utils/text'
import { Text } from '@chakra-ui/react'

interface TextCounterProps {
  textLength: number
}

const getTextColor = (currentLength: number) => {
  const limitation = MAX_CHARACTERS - 20
  if (currentLength > limitation) {
    return 'red.500'
  }
  return 'gray.500'
}

function TextCounter({ textLength }: TextCounterProps) {
  return (
    <Text position="absolute" bottom="2" right="2" fontSize="sm" color={getTextColor(textLength)}>
      {textLength}/{MAX_CHARACTERS}
    </Text>
  )
}

export default TextCounter
