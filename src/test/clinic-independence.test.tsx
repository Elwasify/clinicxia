import { readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { clinicApi } from '../api';
import { demoSeed } from '../api/mocks/data';
import { ClinicProvider, useClinic } from '../features/clinic/ClinicContext';
import { PrescriptionPrintView } from '../features/prescriptions/PrescriptionPrintView';
import { ClinicProfile, Visit } from '../types';

const projectRoot = process.cwd();
const seedPath = 'src/api/mocks/data.ts';
const textExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.html', '.md', '.yaml', '.yml', '.json', '.css']);
const ignoredDirectories = new Set(['.git', 'node_modules', 'dist', 'coverage', 'tmp', 'test-results', 'playwright-report']);

function collectTextFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return ignoredDirectories.has(entry.name) ? [] : collectTextFiles(path);
    return textExtensions.has(extname(entry.name)) ? [path] : [];
  });
}

function ClinicNameProbe() {
  const { profile } = useClinic();
  return <span>{profile?.name}</span>;
}

function renderWithClinic(ui: React.ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return {
    ...render(<QueryClientProvider client={queryClient}><ClinicProvider>{ui}</ClinicProvider></QueryClientProvider>),
    queryClient,
  };
}

describe('clinic identity stays data-driven', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('keeps demo clinic and clinician names out of every non-seed project file', () => {
    const seededNames = [
      demoSeed.clinicProfile.name,
      ...demoSeed.clinicProfile.phoneNumbers,
      demoSeed.clinicProfile.address,
      demoSeed.clinicProfile.specialty,
      demoSeed.clinicProfile.workingHours,
      ...demoSeed.doctors.flatMap((doctor) => [doctor.name, doctor.title, doctor.specialty]),
      ...demoSeed.users.filter((user) => user.role === 'DOCTOR').map((user) => user.fullName),
    ];
    const doctorNamePattern = /(?:أ\.\s*د\.|الدكتور|دكتور|د\.)\s*[\u0600-\u06FF]{3,}(?:\s+[\u0600-\u06FF]{3,}){0,2}/u;
    const clinicNamePattern = /(?:^|\s)(?:عيادة|مركز طبي)\s+[\u0600-\u06FF]{3,}(?:\s+[\u0600-\u06FF]{3,})+/u;

    const findings = collectTextFiles(projectRoot)
      .filter((path) => relative(projectRoot, path).replaceAll('\\', '/') !== seedPath)
      .flatMap((path) => {
        const content = readFileSync(path, 'utf8');
        const names = seededNames.filter((name) => name.length > 3 && content.includes(name));
        const hasNamedDoctor = doctorNamePattern.test(content);
        const hasNamedClinic = clinicNamePattern.test(content);
        return names.length || hasNamedDoctor || hasNamedClinic
          ? [`${relative(projectRoot, path)}: ${[...names, hasNamedDoctor && 'named clinician', hasNamedClinic && 'named clinic'].filter(Boolean).join(', ')}`]
          : [];
      });

    expect(findings).toEqual([]);
  });

  it('propagates a changed ClinicProfile to context and browser title', async () => {
    const changedProfile: ClinicProfile = { ...demoSeed.clinicProfile, name: `${demoSeed.clinicProfile.name} Updated` };
    vi.spyOn(clinicApi, 'getProfile').mockResolvedValue(changedProfile);
    renderWithClinic(<ClinicNameProbe />);

    expect(await screen.findByText(changedProfile.name)).toBeInTheDocument();
    await waitFor(() => expect(document.title).toBe(`${changedProfile.name} | CLINICXIA`));
  });

  it('prints the approving clinician for visits assigned to different doctors', async () => {
    vi.spyOn(clinicApi, 'getProfile').mockResolvedValue(demoSeed.clinicProfile);
    const doctorVisits = demoSeed.doctors.map((doctor) => {
      const visit = demoSeed.visits.find((item) => item.doctorId === doctor.id)!;
      return {
        ...structuredClone(visit),
        approvedByDoctorId: doctor.id,
        approvedByName: doctor.name,
        approvedBySpecialty: doctor.specialty,
      } satisfies Visit;
    });

    for (const visit of doctorVisits) {
      const view = renderWithClinic(<PrescriptionPrintView visit={visit} onClose={() => {}} />);
      const printSheet = view.container.querySelector('.print-container');
      expect(await screen.findByRole('heading', { name: visit.approvedByName })).toBeInTheDocument();
      expect(await screen.findByText(demoSeed.clinicProfile.name)).toBeInTheDocument();
      expect(printSheet).toHaveTextContent(demoSeed.clinicProfile.name);
      expect(printSheet).toHaveTextContent(visit.approvedBySpecialty!);
      view.unmount();
      view.queryClient.clear();
    }
  });
});
