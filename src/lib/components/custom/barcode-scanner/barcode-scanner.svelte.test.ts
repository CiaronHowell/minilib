import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/svelte';
import BarcodeScanner from './barcode-scanner.svelte';

const { stop, decodeFromVideoDevice } = vi.hoisted(() => ({
	stop: vi.fn(),
	decodeFromVideoDevice: vi.fn()
}));

vi.mock('@zxing/browser', () => ({
	BrowserMultiFormatReader: vi.fn().mockImplementation(function () {
		return { decodeFromVideoDevice };
	})
}));

beforeEach(() => {
	stop.mockClear();
	decodeFromVideoDevice.mockReset();
});

describe('BarcodeScanner', () => {
	it('shows a "Scan barcode" button initially, not the video feed', () => {
		render(BarcodeScanner, { onScan: vi.fn() });
		expect(screen.getByRole('button', { name: /scan barcode/i })).toBeInTheDocument();
		expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
	});

	it('starts the video feed and begins decoding when the scan button is clicked', async () => {
		decodeFromVideoDevice.mockResolvedValue({ stop });
		render(BarcodeScanner, { onScan: vi.fn() });

		await fireEvent.click(screen.getByRole('button', { name: /scan barcode/i }));

		await waitFor(() => expect(decodeFromVideoDevice).toHaveBeenCalled());
		expect(screen.queryByRole('button', { name: /scan barcode/i })).not.toBeInTheDocument();
	});

	it('calls onScan with the decoded text and stops scanning on a successful decode', async () => {
		const onScan = vi.fn();
		decodeFromVideoDevice.mockImplementation(async (_device, _video, callback) => {
			callback({ getText: () => '9780306406157' }, undefined);
			return { stop };
		});
		render(BarcodeScanner, { onScan });

		await fireEvent.click(screen.getByRole('button', { name: /scan barcode/i }));

		await waitFor(() => expect(onScan).toHaveBeenCalledWith('9780306406157'));
		await waitFor(() =>
			expect(screen.getByRole('button', { name: /scan barcode/i })).toBeInTheDocument()
		);
	});

	it('ignores NotFoundException decode errors and keeps scanning', async () => {
		const { NotFoundException } = await import('@zxing/library');
		const onScan = vi.fn();
		decodeFromVideoDevice.mockImplementation(async (_device, _video, callback) => {
			callback(undefined, new NotFoundException());
			return { stop };
		});
		render(BarcodeScanner, { onScan });

		await fireEvent.click(screen.getByRole('button', { name: /scan barcode/i }));

		await waitFor(() => expect(decodeFromVideoDevice).toHaveBeenCalled());
		expect(onScan).not.toHaveBeenCalled();
		expect(screen.queryByRole('button', { name: /scan barcode/i })).not.toBeInTheDocument();
		expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
	});

	it('shows an error message for a non-NotFoundException decode error', async () => {
		decodeFromVideoDevice.mockImplementation(async (_device, _video, callback) => {
			callback(undefined, new Error('camera glitch'));
			return { stop };
		});
		render(BarcodeScanner, { onScan: vi.fn() });

		await fireEvent.click(screen.getByRole('button', { name: /scan barcode/i }));

		expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
	});

	it('shows a permissions error and returns to idle when the reader fails to start', async () => {
		decodeFromVideoDevice.mockRejectedValue(new Error('NotAllowedError'));
		render(BarcodeScanner, { onScan: vi.fn() });

		await fireEvent.click(screen.getByRole('button', { name: /scan barcode/i }));

		expect(await screen.findByText(/couldn't access the camera/i)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /scan barcode/i })).toBeInTheDocument();
	});

	it('stops the reader when the close button is clicked while scanning', async () => {
		decodeFromVideoDevice.mockResolvedValue({ stop });
		render(BarcodeScanner, { onScan: vi.fn() });

		await fireEvent.click(screen.getByRole('button', { name: /scan barcode/i }));
		await waitFor(() => expect(decodeFromVideoDevice).toHaveBeenCalled());

		const buttons = screen.getAllByRole('button');
		const closeButton = buttons[buttons.length - 1];
		await fireEvent.click(closeButton);

		expect(stop).toHaveBeenCalled();
		expect(screen.getByRole('button', { name: /scan barcode/i })).toBeInTheDocument();
	});
});
