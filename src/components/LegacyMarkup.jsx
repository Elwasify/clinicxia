function LegacyMarkup({ markup }) {
  return <div className="legacy-markup" dangerouslySetInnerHTML={{ __html: markup }} />;
}

export default LegacyMarkup;
