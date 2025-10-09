import React, { useState } from 'react';
import { ShieldCheck, FileCheck, Microscope } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import blockchainService from '@/services/blockchainService';

interface QualityAssuranceFormProps {
  packageId?: number;
  onSuccess?: () => void;
}

const QualityAssuranceForm: React.FC<QualityAssuranceFormProps> = ({
  packageId: initialPackageId,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    packageId: initialPackageId || '',
    passed: 'true',
    labName: '',
    certificationHash: '',
    notes: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.packageId) {
      toast({
        title: 'Missing Field',
        description: 'Please enter Package ID',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);

      const result = await blockchainService.addQualityAssurance({
        packageId: parseInt(formData.packageId.toString()),
        passed: formData.passed === 'true',
        certificationHash: formData.certificationHash,
        labName: formData.labName,
        notes: formData.notes
      });

      const status = formData.passed === 'true' ? 'PASSED' : 'FAILED';
      toast({
        title: 'Success!',
        description: `Quality assurance recorded: ${status} for Package #${formData.packageId}`,
      });

      // Show transaction details
      if (result.transaction) {
        toast({
          title: 'Blockchain Transaction',
          description: `Transaction Hash: ${result.transaction.hash.substring(0, 10)}...`,
        });
      }

      // Reset form
      if (!initialPackageId) {
        setFormData({
          packageId: '',
          passed: 'true',
          labName: '',
          certificationHash: '',
          notes: ''
        });
      } else {
        setFormData({
          ...formData,
          passed: 'true',
          labName: '',
          certificationHash: '',
          notes: ''
        });
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add quality assurance';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          Quality Assurance Report
        </CardTitle>
        <CardDescription>
          Record QA test results on the blockchain
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="packageId">
              Package ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="packageId"
              type="number"
              placeholder="Enter package ID"
              value={formData.packageId}
              onChange={(e) => setFormData({ ...formData, packageId: e.target.value })}
              disabled={!!initialPackageId || loading}
              required
            />
            <p className="text-xs text-gray-500">
              The package ID from packaging records
            </p>
          </div>

          <div className="space-y-2">
            <Label>
              QA Test Result <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={formData.passed}
              onValueChange={(value) => setFormData({ ...formData, passed: value })}
              disabled={loading}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="passed" />
                <Label htmlFor="passed" className="font-normal cursor-pointer">
                  ✅ Passed - Meets quality standards
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="failed" />
                <Label htmlFor="failed" className="font-normal cursor-pointer">
                  ❌ Failed - Does not meet quality standards
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="labName" className="flex items-center gap-2">
              <Microscope className="w-4 h-4" />
              Lab/Inspector Name
            </Label>
            <Input
              id="labName"
              placeholder="e.g., AgriTest Labs, John Smith QA"
              value={formData.labName}
              onChange={(e) => setFormData({ ...formData, labName: e.target.value })}
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              Name of testing laboratory or QA inspector
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="certificationHash" className="flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              Certification Hash (Optional)
            </Label>
            <Input
              id="certificationHash"
              placeholder="Hash of certification document"
              value={formData.certificationHash}
              onChange={(e) => setFormData({ ...formData, certificationHash: e.target.value })}
              disabled={loading}
            />
            <p className="text-xs text-gray-500">
              Cryptographic hash of QA certificate (if available)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Test Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Test results, observations, measurements..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={loading}
              rows={4}
            />
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-sm">
            <p className="font-semibold text-indigo-900 mb-1">
              <ShieldCheck className="w-4 h-4 inline mr-1" />
              Step 6 of 6: Quality Assurance
            </p>
            <p className="text-indigo-800 text-xs">
              This is the final step in the blockchain traceability process. Recording QA results 
              completes the farm-to-table journey and provides consumers with verified quality assurance.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Recording on Blockchain...' : 'Submit QA Report'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default QualityAssuranceForm;
