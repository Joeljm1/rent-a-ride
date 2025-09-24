import { Card, CardContent, CardDescription, CardHeader } from "../../components/ui/card";

export function CarCard({
  title,
  url,
  content,
}: {
  title: string;
  url: string;
  content: string;
}) {
  console.log(url);
  return (
    <Card>
      <CardHeader>
        {title}
        <CardDescription>
          <img src={url} alt="car image" />
        </CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
