import { Stack,VStack } from "@/ui/Stack";

export const NotFoundPage = () => {
  return (
    <VStack
      $style={{
        minHeight: "100vh",
        flexGrow: "1",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Stack as="span" $style={{ fontSize: "22px" }}>
        404 — Page Not Found
      </Stack>
    </VStack>
  );
};
