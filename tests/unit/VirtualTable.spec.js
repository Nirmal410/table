import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach } from 'vitest'
import VirtualTable from '@/components/VirtualTable.vue'

const mockData = Array.from({ length: 1000 }, (_, i) => ({
  ID: i + 1,
  Name: `User ${i + 1}`,
  Email: `user${i + 1}@test.com`
}))

describe('VirtualTable.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(VirtualTable, {
      props: {
        data: mockData,
        columns: ['ID', 'Name', 'Email'],
        rowHeight: 40,
        visibleCount: 20,
        darkTheme: false
      }
    })
  })

  it('renders table header correctly', () => {
    const header = wrapper.find('.table-header')
    expect(header.exists()).toBe(true)
    
    const headerCells = wrapper.findAll('.header-table th')
    expect(headerCells.length).toBe(3)
    expect(headerCells[0].text()).toBe('ID')
    expect(headerCells[1].text()).toBe('Name')
    expect(headerCells[2].text()).toBe('Email')
  })

  it('renders only visible rows in table body', () => {
    const rows = wrapper.findAll('.data-table tbody tr')
    expect(rows.length).toBe(20) // Should only render visible count
  })

  it('displays correct data in first visible row', () => {
    const firstRow = wrapper.find('.data-table tbody tr')
    const cells = firstRow.findAll('td')
    
    expect(cells[0].text()).toBe('1')
    expect(cells[1].text()).toBe('User 1')
    expect(cells[2].text()).toBe('user1@test.com')
  })

  it('handles scroll events and updates visible rows', async () => {
    const tableBody = wrapper.find('.table-body')
    
    // Mock scroll event
    Object.defineProperty(tableBody.element, 'scrollTop', {
      writable: true,
      value: 400 // This should show rows starting from index 10 (400/40)
    })
    
    await tableBody.trigger('scroll')
    await wrapper.vm.$nextTick()
    
    // Check if the virtual scrolling updated
    const spacerTop = wrapper.find('.spacer-top')
    expect(spacerTop.attributes('style')).toContain('height: 400px')
  })

  it('respects readonly mode', () => {
    expect(wrapper.props().readonly).toBe(true)
  })

  it('shows readonly indicator when in readonly mode', () => {
    const readonlyIndicator = wrapper.find('.readonly-indicator')
    expect(readonlyIndicator.exists()).toBe(true)
    expect(readonlyIndicator.text()).toBe('🔒 READ ONLY')
  })

  it('applies readonly styles when in readonly mode', () => {
    const container = wrapper.find('.virtual-table')
    expect(container.classes()).toContain('readonly')
    
    const rows = wrapper.findAll('.readonly-row')
    expect(rows.length).toBeGreaterThan(0)
    
    const cells = wrapper.findAll('.readonly-cell')
    expect(cells.length).toBeGreaterThan(0)
  })

  it('hides readonly indicator when not in readonly mode', async () => {
    await wrapper.setProps({ readonly: false })
    
    const readonlyIndicator = wrapper.find('.readonly-indicator')
    expect(readonlyIndicator.exists()).toBe(false)
    
    const container = wrapper.find('.virtual-table')
    expect(container.classes()).not.toContain('readonly')
  })

  it('handles empty data gracefully', async () => {
    await wrapper.setProps({ data: [] })
    
    const rows = wrapper.findAll('.data-table tbody tr')
    expect(rows.length).toBe(0)
  })

  it('has correct table structure', () => {
    // Check main container
    expect(wrapper.find('.virtual-table').exists()).toBe(true)
    
    // Check header structure
    expect(wrapper.find('.table-header').exists()).toBe(true)
    expect(wrapper.find('.header-table').exists()).toBe(true)
    
    // Check body structure
    expect(wrapper.find('.table-body').exists()).toBe(true)
    expect(wrapper.find('.data-table').exists()).toBe(true)
    
    // Check spacers for virtual scrolling
    expect(wrapper.find('.spacer-top').exists()).toBe(true)
    expect(wrapper.find('.spacer-bottom').exists()).toBe(true)
  })

  it('supports dark theme', async () => {
    await wrapper.setProps({ darkTheme: true })
    
    const virtualTable = wrapper.find('.virtual-table')
    expect(virtualTable.classes()).toContain('dark-theme')
  })

  it('can toggle between light and dark themes', async () => {
    // Initially light theme
    expect(wrapper.find('.virtual-table').classes()).not.toContain('dark-theme')
    
    // Switch to dark theme
    await wrapper.setProps({ darkTheme: true })
    expect(wrapper.find('.virtual-table').classes()).toContain('dark-theme')
    
    // Switch back to light theme
    await wrapper.setProps({ darkTheme: false })
    expect(wrapper.find('.virtual-table').classes()).not.toContain('dark-theme')
  })
})