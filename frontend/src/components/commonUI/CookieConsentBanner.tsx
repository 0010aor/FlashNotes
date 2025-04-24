import { useState, useEffect } from "react";
import {
    Box,
    Button,
    Flex,
    Text,
    Link,
    VStack,
    IconButton,
} from "@chakra-ui/react";

import { FaTimes as CloseIcon } from "react-icons/fa";
const CookieConsent = () => {
    const [hasConsented, setHasConsented] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        const consent = localStorage.getItem("cookie-consent");
        if (consent) {
            setHasConsented(true);
        } else {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAcceptAll = () => {
        localStorage.setItem("cookie-consent", "all");
        setIsVisible(false);
        setTimeout(() => setHasConsented(true), 300);
    };

    const handleAcceptNecessary = () => {
        localStorage.setItem("cookie-consent", "necessary");
        setIsVisible(false);
        setTimeout(() => setHasConsented(true), 300);
    };

    const handleClose = () => {
        setIsVisible(false);
    };

    if (hasConsented) return null;
    return (
        <Box
            position="fixed"
            bottom="0"
            right="0"
            bg="#2A2438"
            color="white"
            px={6}
            py={4}
            zIndex="toast"
            boxShadow="0 -2px 10px rgba(0, 0, 0, 0.2)"
            transform={isVisible ? "translateY(0)" : "translateY(100%)"}
            transition="transform 0.5s ease-in-out"
            w={350}
            m={4}
        >
            <Flex
                direction={["column", "row"]}
                align="center"
                justify="space-between"
                maxW="6xl"
                mx="auto"
                gap={4}
                flexWrap="wrap"
            >
                <VStack align="start" flex="1">
                    <Text fontWeight="bold" fontSize="md">We use cookies 🍪</Text>
                    <Text fontSize="sm">
                        To enhance your experience on FlashNotes. By continuing, you agree to our use of cookies as outlined in our
                        <Link color="#A799B7" ml={1} href="/privacy-policy">
                            Privacy Policy
                        </Link>.
                    </Text>
                </VStack>

                <Flex gap={2} wrap="wrap">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAcceptNecessary}
                        borderColor="#A799B7"
                        color="#A799B7"
                        minW={30}
                        _hover={{ bg: "#3B3049" }}
                        
                    >
                        Deny All
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleAcceptAll}
                        bg="#A799B7"
                        color="#2A2438"
                        minW={40}
                        _hover={{ bg: "#8A7B99" }}
                    >
                        Accept All
                    </Button>
                </Flex>
                <IconButton
                    position="absolute"
                    top={0}
                    right={0}
                    aria-label="Close cookie consent banner"
                    size="sm"
                    variant="ghost"
                    color="#A799B7"
                    _hover={{ bg: "#3B3049" }}
                    onClick={handleClose}
                    alignSelf="flex-start"
                >
                    <CloseIcon/>
                </IconButton>
            </Flex>
        </Box>
    );
};

export default CookieConsent;
