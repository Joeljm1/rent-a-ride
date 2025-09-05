import {
  Button,
  Head,
  Body,
  Text,
  Container,
  Tailwind,
  Html,
  pixelBasedPreset,
} from "@react-email/components";

interface emailProps {
  name: string;
  url: string;
}
export function EmailBody({ name, url }: emailProps) {
  return (
    <Tailwind
      config={{
        presets: [pixelBasedPreset],
        theme: {
          extend: {
            colors: {
              brand: "#007291",
            },
          },
        },
      }}
    >
      <Html>
        <Head />
        <Body>
          <Container>
            <Text>Welcome to Rent a Ride, {name}</Text>
            <Text>To confirm your registration click the link below</Text>
            <Button href={url}>Click Here</Button>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}
