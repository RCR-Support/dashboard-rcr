'use client';

import { useState } from 'react';
import { CompanySelect } from '@/interfaces/company.interface';
import { TfiPlus } from 'react-icons/tfi';
import { Button, Input } from '@heroui/react';
import { CiSearch } from 'react-icons/ci';
import { Building2, Globe, MapPin, Phone } from 'lucide-react';
import { getCompanyUsers } from '@/actions/company/userCompany-actions';
import { formatPhoneNumber } from '@/lib/formatPhoneNumber';
import { CompanyModal } from './company-modal';

interface Props {
  companies: CompanySelect[];
}

export const CompaniesGrid = ({ companies }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<CompanySelect | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadCompanyData = async (companyId: string) => {
    try {
      const response = await getCompanyUsers(companyId);
      if (response.success) {
        return {
          users: response.users,
          contracts: response.contracts,
          summary: response.summary,
        };
      }
      console.error('Error:', response.error);
      return null;
    } catch (error) {
      console.error('Error cargando datos:', error);
      return null;
    }
  };

  const openModal = async (company: CompanySelect) => {
    try {
      const response = await getCompanyUsers(company.value);
      console.log('Respuesta de getCompanyUsers:', response); // Debug

      if (response.success) {
        setSelectedCompany({
          ...company,
          users: response.users || [],
          contracts: response.contracts || [], // Nota: Cambiado a Contract
          summary: {
            totalUsers: response.users?.length || 0,
            totalContracts: response.contracts?.length || 0,
          },
        });
        setIsOpen(true);
      } else {
        console.error('Error al cargar datos:', response.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedCompany(null);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedCompany(null);
    setIsEditing(false);
  };

  const normalizeText = (text: string) =>
    text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const normalizedFilter = normalizeText(searchTerm.toLowerCase());
  const filteredCompanies = companies.filter(company =>
    normalizeText(company.label).toLowerCase().includes(normalizedFilter)
  );

  return (
    <>
      <div className="w-full card-box col-span-12">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between md:w-1/2 gap-3 items-end">
            <Input
              isClearable
              classNames={{
                inputWrapper: 'border-1',
              }}
              placeholder="Buscar empresa..."
              size="sm"
              startContent={<CiSearch className="text-default-300" />}
              value={searchTerm}
              variant="bordered"
              onClear={() => setSearchTerm('')}
              onValueChange={setSearchTerm}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-12 grid-rows-auto gap-4 w-full col-span-12 mt-6">
        {filteredCompanies.map(company => (
          <button
            key={company.value}
            onClick={() => openModal(company)}
            className="col-span-6 md:col-span-6 xl:col-span-3 card-box"
          >
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="font-semibold truncate text-ellipsis max-w-36 xl:max-w-44">
                  {company.label.split(' (')[0]}
                </div>
                <div className="hidden md:flex items-center gap-3 truncate text-ellipsis max-w-36 2xl:max-w-44">
                  <Phone className="h-4 w-4 text-cyan-500 dark:text-cyan-300" />
                  {/* Removemos el emoji del teléfono del texto */}
                  {formatPhoneNumber(
                    company.description.split(' | ')[0].replace('📞', '').trim()
                  )}
                </div>
              </div>
              <TfiPlus className="hidden md:block text-2xl text-[#03c9d7] dark:text-[#327f84]" />
            </div>
          </button>
        ))}

        <CompanyModal
          isOpen={isOpen}
          onClose={handleClose}
          company={selectedCompany}
        />
      </div>
    </>
  );
};
