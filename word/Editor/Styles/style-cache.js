/*
 * (c) Copyright Ascensio System SIA 2010-2024
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */

"use strict";

(function()
{
	const memory = new AscCommon.CMemory();
	memory.Init(1000);
	
	/**
	 * @param data
	 * @constructor
	 */
	function CacheEntry(data)
	{
		this.ref = 1;
		this.data = data;
	}
	
	/**
	 * Класс для кэширования объектов стиля. В текущий момент работает только с объектами, которые пишут себя в
	 * бинарник (WriteToBinary)
	 * @constructor
	 */
	function StyleCache()
	{
		this.data = new Map();
		// Key of every cached object, so remove() (called with the cached object itself) does not serialize again
		this.keys = new WeakMap();
	}
	StyleCache.prototype.add = function(data)
	{
		let key   = this.getKey(data);
		let entry = this.data.get(key);
		if (entry)
		{
			++entry.ref;
		}
		else
		{
			entry = new CacheEntry(data);
			this.data.set(key, entry);
			this.keys.set(data, key);
		}
		
		return entry.data;
	};
	StyleCache.prototype.remove = function(data)
	{
		let key = this.keys.get(data);
		if (undefined === key)
			key = this.getKey(data);
		
		let entry = this.data.get(key);
		if (!entry)
			return;
		
		--entry.ref;
		if (!entry.ref)
		{
			this.data.delete(key);
			this.keys.delete(entry.data);
		}
	};
	StyleCache.prototype.getKey = function(data)
	{
		memory.Seek(0);
		data.WriteToBinary(memory);
		// Exact key: the serialized bytes themselves, as a string. Cheaper than sha256 + hex on every
		// CTextPr compile (shape text on pptx open) and it cannot collide.
		return bytesToKey(memory.data, memory.pos);
	};
	function bytesToKey(bytes, len)
	{
		const CHUNK = 8192;
		if (len <= CHUNK)
			return String.fromCharCode.apply(null, bytes.subarray(0, len));
		
		let key = "";
		for (let pos = 0; pos < len; pos += CHUNK)
			key += String.fromCharCode.apply(null, bytes.subarray(pos, Math.min(pos + CHUNK, len)));
		return key;
	}
	
	//--------------------------------------------------------export----------------------------------------------------
	AscWord.g_textPrCache = new StyleCache();
	
})(window);
