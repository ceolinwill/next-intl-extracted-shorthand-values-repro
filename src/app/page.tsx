import { useExtracted } from "next-intl";

function Plain() {
  const t = useExtracted();
  const values = { name: "Jane" };

  return (
    <>
      <li data-case="t, { values }">
        {t({ message: "Hello {name}!", description: "Greets the user", values })}
      </li>
      <li data-case="t, { values: values }">
        {t({ message: "Hello {name}!", description: "Greets the user", values: values })}
      </li>
    </>
  );
}

function Rich() {
  const t = useExtracted();
  const values = { b: (chunks: React.ReactNode) => <b>{chunks}</b>, name: "Jane" };

  return (
    <>
      <li data-case="t.rich, { values }">
        {t.rich({ message: "Hello <b>{name}</b>!", description: "Greets the user", values })}
      </li>
      <li data-case="t.rich, { values: values }">
        {t.rich({ message: "Hello <b>{name}</b>!", description: "Greets the user", values: values })}
      </li>
    </>
  );
}

function Markup() {
  const t = useExtracted();
  const values = { b: (chunks: string) => `<b>${chunks}</b>`, name: "Jane" };

  return (
    <>
      <li data-case="t.markup, { values }">
        {t.markup({ message: "Hello <b>{name}</b>!", description: "Greets the user", values })}
      </li>
      <li data-case="t.markup, { values: values }">
        {t.markup({ message: "Hello <b>{name}</b>!", description: "Greets the user", values: values })}
      </li>
    </>
  );
}

export default function Page() {
  return (
    <ul>
      <Plain />
      <Rich />
      <Markup />
    </ul>
  );
}
