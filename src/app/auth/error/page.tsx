export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Erreur d&apos;authentification</h1>
        <p className="text-muted-foreground mb-6">
          Une erreur s&apos;est produite lors de l&apos;authentification.
        </p>
        <a
          href="/login"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Retour à la connexion
        </a>
      </div>
    </div>
  )
}
