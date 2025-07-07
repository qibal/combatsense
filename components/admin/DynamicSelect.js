'use client';

import { useState } from 'react';
import { Button } from '@/components/Shadcn/button';
import { Input } from '@/components/Shadcn/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Shadcn/select';
import { Label } from '@/components/Shadcn/label';
import { Plus } from 'lucide-react';
import { createUnit } from '@/actions/admin/accounts/unit_actions';
import { createRank } from '@/actions/admin/accounts/rank_actions';

/**
 * Dynamic Form Component untuk Unit dan Rank
 * Memungkinkan user pilih existing data atau tambah baru secara inline
 */
export function DynamicUnitSelect({ units, name = "unit_id" }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [unitList, setUnitList] = useState(units);
  const [selectedUnit, setSelectedUnit] = useState('');

  const handleAddUnit = async () => {
    if (!newUnitName.trim()) return;

    setIsAdding(true);

    try {
      const result = await createUnit({ unit_name: newUnitName.trim() });

      if (result.success) {
        // Update list unit dengan data baru
        const newUnit = result.data;
        setUnitList(prev => [...prev, newUnit]);
        setSelectedUnit(newUnit.unit_id.toString());
        setNewUnitName('');

        // Set hidden input value untuk form utama
        const hiddenInput = document.querySelector(`input[name="${name}"]`);
        if (hiddenInput) {
          hiddenInput.value = newUnit.unit_id;
        }
      }
    } catch (error) {
      console.error('Error adding unit:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>Unit</Label>
      <div className="space-y-2">
        <Select name={name} value={selectedUnit} onValueChange={setSelectedUnit}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih unit" />
          </SelectTrigger>
          <SelectContent>
            {unitList.map((unit) => (
              <SelectItem key={unit.unit_id} value={unit.unit_id.toString()}>
                {unit.unit_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Inline form tambah unit */}
        <div className="flex gap-2">
          <Input
            value={newUnitName}
            onChange={(e) => setNewUnitName(e.target.value)}
            placeholder="Ketik unit baru..."
            className="flex-1"
            disabled={isAdding}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddUnit}
            disabled={isAdding || !newUnitName.trim()}
          >
            <Plus className="h-4 w-4 mr-1" />
            {isAdding ? 'Menambah...' : 'Tambah'}
          </Button>
        </div>
      </div>

      {/* Hidden input untuk form submission */}
      <input type="hidden" name={name} value={selectedUnit} />
    </div>
  );
}

export function DynamicRankSelect({ ranks, name = "rank_id" }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newRankName, setNewRankName] = useState('');
  const [rankList, setRankList] = useState(ranks);
  const [selectedRank, setSelectedRank] = useState('');

  const handleAddRank = async () => {
    if (!newRankName.trim()) return;

    setIsAdding(true);

    try {
      const result = await createRank({ rank_name: newRankName.trim() });

      if (result.success) {
        // Update list rank dengan data baru
        const newRank = result.data;
        setRankList(prev => [...prev, newRank]);
        setSelectedRank(newRank.rank_id.toString());
        setNewRankName('');

        // Set hidden input value untuk form utama
        const hiddenInput = document.querySelector(`input[name="${name}"]`);
        if (hiddenInput) {
          hiddenInput.value = newRank.rank_id;
        }
      }
    } catch (error) {
      console.error('Error adding rank:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>Pangkat</Label>
      <div className="space-y-2">
        <Select name={name} value={selectedRank} onValueChange={setSelectedRank}>
          <SelectTrigger>
            <SelectValue placeholder="Pilih pangkat" />
          </SelectTrigger>
          <SelectContent>
            {rankList.map((rank) => (
              <SelectItem key={rank.rank_id} value={rank.rank_id.toString()}>
                {rank.rank_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Inline form tambah pangkat */}
        <div className="flex gap-2">
          <Input
            value={newRankName}
            onChange={(e) => setNewRankName(e.target.value)}
            placeholder="Ketik pangkat baru..."
            className="flex-1"
            disabled={isAdding}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddRank}
            disabled={isAdding || !newRankName.trim()}
          >
            <Plus className="h-4 w-4 mr-1" />
            {isAdding ? 'Menambah...' : 'Tambah'}
          </Button>
        </div>
      </div>

      {/* Hidden input untuk form submission */}
      <input type="hidden" name={name} value={selectedRank} />
    </div>
  );
}

/**
 * Cara penggunaan:
 * 
 * // Import component
 * import { DynamicUnitSelect, DynamicRankSelect } from '@/components/admin/dynamic_form';
 * 
 * // Di dalam form
 * <form action={createUser}>
 *   <DynamicUnitSelect units={units} name="unit_id" />
 *   <DynamicRankSelect ranks={ranks} name="rank_id" />
 *   <button type="submit">Submit</button>
 * </form>
 * 
 * // Features:
 * - Select dari existing data
 * - Input inline untuk tambah data baru  
 * - Auto update list setelah tambah
 * - Auto select data yang baru ditambah
 * - State management dengan useState
 * - Error handling
 * - Loading state saat menambah data
 */