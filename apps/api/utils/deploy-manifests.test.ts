import fs from 'node:fs';
import path from 'node:path';

describe('Kubernetes deployment manifests', () => {
  test('pulls the refreshed latest image on each rollout', () => {
    const deployment = fs.readFileSync(path.resolve(__dirname, '../../../deploy/k8s/deployment.yaml'), 'utf8');

    expect(deployment).toContain('imagePullPolicy: Always');
  });

  test('configures public TLS for the wiki ingress', () => {
    const ingress = fs.readFileSync(path.resolve(__dirname, '../../../deploy/k8s/ingress.yaml'), 'utf8');

    expect(ingress).toContain('traefik.ingress.kubernetes.io/router.entrypoints: websecure');
    expect(ingress).toContain('traefik.ingress.kubernetes.io/router.tls: "true"');
    expect(ingress).toContain('traefik.ingress.kubernetes.io/router.tls.certresolver: letsencrypt');
    expect(ingress).toContain('tls:');
    expect(ingress).toContain('- wiki-team.hackathon.sev-2.com');
    expect(ingress).not.toContain('secretName:');
  });

  test('deploys an in-cluster Postgres database with pgvector using temporary cluster storage', () => {
    const postgres = fs.readFileSync(path.resolve(__dirname, '../../../deploy/k8s/postgres-deployment.yaml'), 'utf8');
    const service = fs.readFileSync(path.resolve(__dirname, '../../../deploy/k8s/postgres-service.yaml'), 'utf8');
    const kustomization = fs.readFileSync(path.resolve(__dirname, '../../../deploy/k8s/kustomization.yaml'), 'utf8');

    expect(postgres).toContain('kind: Deployment');
    expect(postgres).toContain('image: pgvector/pgvector:pg16');
    expect(postgres).toContain('emptyDir: {}');
    expect(postgres).toContain('mountPath: /var/lib/postgresql/data');
    expect(service).toContain('name: codebase-wiki-postgres');
    expect(service).toContain('port: 5432');
    expect(kustomization).toContain('postgres-deployment.yaml');
  });
});
