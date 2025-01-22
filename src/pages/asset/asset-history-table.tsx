import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Quote } from '@/lib/types';
import { Icons } from '@/components/icons';
import DatePickerInput from '@/components/ui/data-picker-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from '@/components/ui/popover';
import { MoneyInput } from '@/components/ui/money-input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface AssetHistoryTableProps {
  data: Quote[];
  isManualDataSource?: boolean;
  onSaveQuote?: (quote: Quote) => void;
  onDeleteQuote?: (quoteId: string) => void;
  onChangeDataSource?: (isManual: boolean) => void;
}

const ITEMS_PER_PAGE = 10;

const emptyQuote: Partial<Quote> = {
  date: new Date().toISOString(),
  open: 0,
  high: 0,
  low: 0,
  close: 0,
  volume: 0,
  adjclose: 0,
};

export const AssetHistoryTable: React.FC<AssetHistoryTableProps> = ({
  data,
  isManualDataSource = false,
  onSaveQuote,
  onDeleteQuote,
  onChangeDataSource,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Partial<Quote>>({});
  const [isAddingQuote, setIsAddingQuote] = useState(false);
  const [newQuote, setNewQuote] = useState<Partial<Quote>>(emptyQuote);

  useEffect(() => {
    if (isAddingQuote) {
      setNewQuote(emptyQuote);
    }
  }, [isAddingQuote]);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = data.slice(startIndex, endIndex);

  const handleEdit = (quote: Quote) => {
    setEditingId(quote.id);
    setEditedValues(quote);
  };

  const handleSave = () => {
    if (editingId && onSaveQuote && editedValues) {
      onSaveQuote({ ...editedValues } as Quote);
      setEditingId(null);
      setEditedValues({});
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedValues({});
  };

  const handleInputChange = (field: keyof Quote, value: string | Date, isNew = false) => {
    const setValue = field === 'date' ? (value as Date).toISOString() : Number(value);

    if (isNew) {
      setNewQuote((prev) => ({
        ...prev,
        [field]: setValue,
      }));
    } else {
      setEditedValues((prev) => ({
        ...prev,
        [field]: setValue,
      }));
    }
  };

  const handleAddNew = () => {
    if (onSaveQuote) {
      onSaveQuote({ ...newQuote, id: crypto.randomUUID() } as Quote);
      setIsAddingQuote(false);
      setNewQuote(emptyQuote);
    }
  };

  const handleDelete = (quoteId: string) => {
    if (onDeleteQuote) {
      onDeleteQuote(quoteId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-2">
            {/* <h4 className="text-sm font-medium">Quote History</h4> */}
          </div>
          <div className="flex items-center space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <div className="flex items-center space-x-2">
                  <Switch id="manual-tracking" checked={isManualDataSource} />
                  <Label htmlFor="manual-tracking" className="cursor-pointer">
                    Manual tracking
                  </Label>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-[360px] p-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Change Tracking Mode</h4>
                  {isManualDataSource ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Switching to automatic tracking will enable data fetching from Market Data
                        Provider. Please note that this will override any manually entered quotes on
                        the next sync.
                      </p>
                      <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                        ⚠️ Your manually entered historical data may be lost.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Switching to manual tracking will stop automatic data fetching from Market
                        Data Provider. You'll need to enter and maintain price data manually.
                      </p>
                      <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                        ⚠️ Automatic price updates will be disabled.
                      </p>
                    </>
                  )}
                  <div className="flex justify-end space-x-2">
                    <PopoverClose asChild>
                      <Button variant="ghost" size="sm">
                        Cancel
                      </Button>
                    </PopoverClose>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onChangeDataSource?.(!isManualDataSource)}
                    >
                      Confirm Change
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            {isManualDataSource && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsAddingQuote(true)}
                disabled={isAddingQuote}
              >
                <Icons.PlusCircle className="mr-2 h-4 w-4" />
                Add Quote
              </Button>
            )}
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Open</TableHead>
                <TableHead>High</TableHead>
                <TableHead>Low</TableHead>
                <TableHead>Close</TableHead>
                <TableHead>Volume</TableHead>
                {isManualDataSource && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isAddingQuote && (
                <TableRow>
                  <TableCell>
                    <DatePickerInput
                      value={new Date(newQuote.date || '')}
                      onChange={(date: Date | undefined) =>
                        date && handleInputChange('date', date, true)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={newQuote.open}
                      onChange={(e) => handleInputChange('open', e.target.value, true)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={newQuote.high}
                      onChange={(e) => handleInputChange('high', e.target.value, true)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={newQuote.low}
                      onChange={(e) => handleInputChange('low', e.target.value, true)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={newQuote.close}
                      onChange={(e) => handleInputChange('close', e.target.value, true)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={newQuote.volume}
                      onChange={(e) => handleInputChange('volume', e.target.value, true)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleAddNew}
                        className="h-8 w-8"
                      >
                        <Icons.Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsAddingQuote(false)}
                        className="h-8 w-8"
                      >
                        <Icons.Close className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {currentData.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell>
                    {editingId === quote.id ? (
                      <DatePickerInput
                        value={new Date(editedValues.date || '')}
                        onChange={(date: Date | undefined) =>
                          date && handleInputChange('date', date)
                        }
                      />
                    ) : (
                      format(new Date(quote.date), 'yyyy-MM-dd')
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === quote.id ? (
                      <MoneyInput
                        value={editedValues.open}
                        onChange={(e) => handleInputChange('open', e.target.value)}
                      />
                    ) : (
                      quote.open
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === quote.id ? (
                      <MoneyInput
                        value={editedValues.high}
                        onChange={(e) => handleInputChange('high', e.target.value)}
                      />
                    ) : (
                      quote.high
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === quote.id ? (
                      <MoneyInput
                        value={editedValues.low}
                        onChange={(e) => handleInputChange('low', e.target.value)}
                      />
                    ) : (
                      quote.low
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === quote.id ? (
                      <MoneyInput
                        value={editedValues.close}
                        onChange={(e) => handleInputChange('close', e.target.value)}
                      />
                    ) : (
                      quote.close
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === quote.id ? (
                      <MoneyInput
                        value={editedValues.volume}
                        onChange={(e) => handleInputChange('volume', e.target.value)}
                      />
                    ) : (
                      quote.volume
                    )}
                  </TableCell>
                  {isManualDataSource && (
                    <TableCell>
                      {editingId === quote.id ? (
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSave}
                            className="h-8 w-8"
                          >
                            <Icons.Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCancel}
                            className="h-8 w-8"
                          >
                            <Icons.Close className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(quote)}
                            className="h-8 w-8"
                          >
                            <Icons.Pencil className="h-4 w-4" />
                          </Button>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Icons.Trash className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent>
                              <div className="flex flex-col items-center space-y-2">
                                <h4 className="font-medium">Delete Quote</h4>
                                <p className="text-center text-sm text-muted-foreground">
                                  Are you sure you want to delete this historical quote? This action
                                  cannot be undone.
                                </p>
                                <div className="flex space-x-2">
                                  <PopoverClose asChild>
                                    <Button variant="ghost" size="sm">
                                      Cancel
                                    </Button>
                                  </PopoverClose>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(quote.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Select
            value={currentPage.toString()}
            onValueChange={(value) => setCurrentPage(parseInt(value))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Page..." />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: totalPages }, (_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  Page {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssetHistoryTable;