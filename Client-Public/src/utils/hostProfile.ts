export function hostProfilePath(host: { slug?: string | null; id: number }) {
    return `/host/${host.slug || host.id}`;
}
